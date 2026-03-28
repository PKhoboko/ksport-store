/**
 * app/admin/sync/route.ts
 *
 * POST  { "secret": "..." }
 *
 * Handles BOTH filename formats:
 *
 *  FORMAT A (parenthesis — most files, often with trailing spaces inside brackets):
 *    (MODEL NAME) (SIDE VIEW )(COLOUR ) (SIZE 8 ) (SALES PRICE R1000 ) (REAL PRICE R1,300).jpeg
 *
 *  FORMAT B (inline price suffix — old files):
 *    MODEL NAME COLOUR R3500...R2500.jpg
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const GITHUB_USER   = 'PKhoboko';
const GITHUB_REPO   = 'ZikianoOutBack';
const GITHUB_FOLDER = 'images';
const GITHUB_BRANCH = 'main';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedFile {
    modelName:   string;
    modelKey:    string;
    view:        string;
    colourLabel: string;
    variantSlug: string;
    size:        number;
    salePrice:   number;
    realPrice:   number;
    isSold:      boolean;
    imageUrl:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VIEW_KEYWORDS = [
    'SIDE VIEW','FRONT VIEW','BACK VIEW','LEFT VIEW','RIGHT VIEW',
    'TOP VIEW','DETAIL VIEW','SIZE VIEW','CORK MIDSOLE','SLIDE SHOW',
];

function toTitleCase(s: string) {
    return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractView(text: string): string {
    const up = text.toUpperCase();
    for (const kw of VIEW_KEYWORDS) {
        if (up.includes(kw)) return kw;
    }
    return 'SIDE VIEW';
}

/**
 * Parse price from strings like:
 *   "SALES PRICE R1000 "  →  1000
 *   "REAL PRICE R1,300"   →  1300
 *   "R2500"               →  2500
 */
function parsePrice(raw: string): number {
    // Strip everything except digits — handles commas, spaces, "R" prefix
    const digits = raw.replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : 0;
}

// ─── FORMAT A: parenthesis segments ──────────────────────────────────────────
//
// KEY FIX: filenames have inconsistent spacing INSIDE brackets:
//   (SIDE VIEW )  (SIZE 8 )  (SALES PRICE R1000 )
// We normalise all internal whitespace and trim each segment before matching.

function parseFormatA(base: string, imageUrl: string): ParsedFile | null {
    // Normalise multiple consecutive spaces → single space (handles "  " inside brackets)
    const normalised = base.replace(/\s+/g, ' ');

    // Extract all (…) segments, trimming each
    const segs = [...normalised.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim());
    if (segs.length < 3) return null;

    const modelRaw = segs[0];

    // --- Identify segments by content (NOT by position) ---
    // Use loose regexes — no ^ anchor, \s* instead of \s+ to survive extra spaces

    const viewSeg = segs.find(s =>
        VIEW_KEYWORDS.some(v => s.toUpperCase().includes(v))
    );

    // "SIZE 8" / "SIZE 12" — just needs SIZE + any digit somewhere in the segment
    const sizeSeg = segs.find(s =>
        /SIZE/i.test(s) && /\d/.test(s) &&
        !VIEW_KEYWORDS.some(v => s.toUpperCase().includes(v))
    );

    // "REAL PRICE R1,300" — REAL + PRICE anywhere in segment
    const realSeg = segs.find(s => /REAL\s*PRICE/i.test(s));

    // "SALES PRICE R1000" or "SALE PRICE R1000"
    const saleSeg = segs.find(s => /SALES?\s*PRICE/i.test(s));

    const realPrice = parsePrice(realSeg ?? '');
    const salePrice = parsePrice(saleSeg ?? '');

    // Colour = first segment that is NOT model/view/size/price/SOLD-only
    const classified = new Set(
        [modelRaw, viewSeg, sizeSeg, realSeg, saleSeg].filter(Boolean) as string[]
    );

    let colourRaw = segs.find(s =>
        !classified.has(s) &&
        !/^\s*SOLD\s*$/i.test(s)
    ) ?? '';

    // Strip trailing "SOLD" notes from colour label
    colourRaw = colourRaw.replace(/\bSOLD\b.*/i, '').trim();

    // Positional fallback: 3rd segment (index 2)
    if (!colourRaw && segs.length > 2) {
        colourRaw = segs[2].replace(/\bSOLD\b.*/i, '').trim();
    }

    if (!colourRaw) return null;

    const size      = parseInt(sizeSeg?.match(/(\d+)/)?.[1] ?? '0', 10);
    const view      = viewSeg ? extractView(viewSeg) : 'SIDE VIEW';
    const isSold    = /SOLD/i.test(base);
    const modelKey  = modelRaw.toUpperCase().replace(/\s+/g, '_');
    const modelName = toTitleCase(modelRaw);
    const colourLabel = toTitleCase(colourRaw);
    const variantSlug = slugify(`${modelRaw} ${colourRaw}`);

    return {
        modelName, modelKey, view, colourLabel, variantSlug,
        size,
        salePrice: salePrice || realPrice,
        realPrice: realPrice || salePrice,
        isSold,
        imageUrl,
    };
}

// ─── FORMAT B: "MODEL COLOUR R3500...R2500" ───────────────────────────────────

function parseFormatB(base: string, imageUrl: string): ParsedFile | null {
    const clean = base.replace(/\.\w{3,4}$/, '').replace(/\s*\(\d+\)\s*$/, '').trim();
    const priceMatch = clean.match(/R([\d,]+)\s*\.\.\.\s*R([\d,]+)/i);
    if (!priceMatch) return null;

    const p1 = parsePrice(priceMatch[1]);
    const p2 = parsePrice(priceMatch[2]);
    const realPrice = Math.max(p1, p2);
    const salePrice = Math.min(p1, p2);

    const withoutPrices = clean.replace(/R[\d,]+\s*\.\.\.\s*R[\d,]+.*/i, '').trim();
    const words = withoutPrices.split(/\s+/);
    if (words.length < 2) return null;

    const modelRaw    = `${words[0]} ${words[1]}`;
    const colourRaw   = words.slice(2).join(' ').replace(/\bSOLD\b.*/i, '').trim();
    const view        = extractView(withoutPrices);
    const isSold      = /SOLD/i.test(clean);
    const modelKey    = modelRaw.toUpperCase().replace(/\s+/g, '_');
    const modelName   = toTitleCase(modelRaw);
    const colourLabel = toTitleCase(colourRaw || 'Default');
    const variantSlug = slugify(`${modelRaw} ${colourRaw || 'default'}`);

    return {
        modelName, modelKey, view, colourLabel, variantSlug,
        size: 0, salePrice, realPrice, isSold, imageUrl,
    };
}

// ─── Master parser ────────────────────────────────────────────────────────────

function parseFilename(filename: string): ParsedFile | null {
    const decoded  = decodeURIComponent(filename);
    const base     = decoded.replace(/\.[^.]+$/, '').trim();
    const imageUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_FOLDER}/${encodeURIComponent(filename)}`;

    return parseFormatA(base, imageUrl) ?? parseFormatB(base, imageUrl);
}

// ─── Route handler ────────────────────────────────────────────────────────────

interface GithubFile { name: string; type: string; }

export async function POST(req: Request) {
    // Auth
    const body = await req.json().catch(() => ({}));
    if (body.secret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch GitHub file list
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FOLDER}?ref=${GITHUB_BRANCH}`;
    const ghRes = await fetch(apiUrl, {
        headers: {
            'Accept':     'application/vnd.github.v3+json',
            'User-Agent': 'Zikiano-Sync/3.0',
            // 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,  ← add if rate-limited
        },
        cache: 'no-store',
    });

    if (!ghRes.ok) {
        const txt = await ghRes.text();
        return NextResponse.json({ error: `GitHub API ${ghRes.status}: ${txt}` }, { status: 500 });
    }

    const allFiles: GithubFile[] = await ghRes.json();
    const imageFiles = allFiles.filter(
        f => f.type === 'file' && /\.(jpe?g|png|webp)$/i.test(f.name)
    );

    const upserted: string[] = [];
    const failed:   { file: string; reason: string }[] = [];
    const skipped:  string[] = [];

    for (const file of imageFiles) {
        const parsed = parseFilename(file.name);

        if (!parsed) {
            skipped.push(file.name);
            continue;
        }

        const {
            modelName, modelKey, view, colourLabel, variantSlug,
            size, salePrice, realPrice, isSold, imageUrl,
        } = parsed;

        const description = [modelName, view, colourLabel].join(' | ');

        const row = {
            name:           modelKey,
            brand:          'ZIKIANO',
            price:          salePrice,
            original_price: realPrice > 0 ? realPrice : null,
            image_url:      imageUrl,
            color_label:    colourLabel,
            view_type:      view,
            variant_slug:   variantSlug,
            description,
            size:           size > 0 ? String(size) : null,
            stock:          isSold ? 0 : 10,
            category:       'Lite Collection',
        };

        const { error } = await supabase
            .from('shoes')
            .upsert(row, { onConflict: 'image_url' });

        if (error) {
            failed.push({ file: file.name, reason: error.message });
        } else {
            upserted.push(`${modelKey} | ${view} | ${colourLabel}`);
        }
    }

    return NextResponse.json({
        summary: {
            total:    imageFiles.length,
            upserted: upserted.length,
            skipped:  skipped.length,
            failed:   failed.length,
        },
        upserted,
        skipped,
        failed,
    });
}