import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const GITHUB_USER = "PKhoboko";
const GITHUB_REPO = "ZikianoOutBack";
const GITHUB_FOLDER = "images";
const GITHUB_BRANCH = "main";

function parseFilename(filename: string) {
    let base = filename.replace(/\.[^/.]+$/, '').trim();
    base = base.replace(/\s*\(\d+\)\s*$/, '').trim();

    const priceMatch = base.match(/R(\d+)\.\.\.R(\d+)\s*$/i);
    if (!priceMatch) return null;

    const originalPrice = parseInt(priceMatch[1], 10);
    const salePrice = parseInt(priceMatch[2], 10);
    const withoutPrices = base.replace(/R\d+\.\.\.R\d+\s*$/i, '').trim();
    const words = withoutPrices.split(/\s+/);
    if (words.length < 2) return null;

    const modelCode = `${words[0]} ${words[1]}`;
    const colour = words.slice(2).join(' ');
    const shoeName = colour ? `${modelCode}_${colour}` : modelCode;

    return { modelCode, colour, originalPrice, salePrice, shoeName };
}

export async function POST(req: Request) {
    const { secret } = await req.json();
    if (secret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FOLDER}?ref=${GITHUB_BRANCH}`;
    const ghRes = await fetch(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Zikiano-Sync' },
    });

    if (!ghRes.ok) {
        return NextResponse.json({ error: 'GitHub API error' }, { status: 500 });
    }

    const files: { name: string }[] = await ghRes.json();

    const mainImages = files.filter(
        (f) => /\.(jpg|jpeg|png|webp)$/i.test(f.name) && !/\(\d+\)\s*\.[^.]+$/.test(f.name)
    );

    const { data: existing } = await supabase.from('shoes').select('name');
    const existingNames = new Set((existing ?? []).map((s: { name: string }) => s.name));

    const inserted: string[] = [];
    const skipped: string[] = [];
    const failed: { name: string; reason: string }[] = [];

    for (const file of mainImages) {
        const parsed = parseFilename(file.name);

        if (!parsed) {
            failed.push({ name: file.name, reason: 'Could not parse filename' });
            continue;
        }

        const { shoeName, salePrice, originalPrice } = parsed;

        if (existingNames.has(shoeName)) {
            skipped.push(shoeName);
            continue;
        }

        const imageUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_FOLDER}/${encodeURIComponent(file.name)}`;

        const { error } = await supabase.from('shoes').insert({
            name: shoeName,
            brand: 'ZIKIANO',
            price: salePrice,
            image_url: imageUrl,
            description: '',
            stock: 10,
            category: '',
        });

        if (error) {
            failed.push({ name: shoeName, reason: error.message });
        } else {
            inserted.push(`${shoeName} — R${salePrice} (was R${originalPrice})`);
            existingNames.add(shoeName);
        }
    }

    return NextResponse.json({ inserted, skipped, failed });
}