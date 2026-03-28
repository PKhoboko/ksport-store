/**
 * lib/parseShoe.ts
 *
 * Pure parsing utilities — no Supabase dependency.
 * Used as a fallback when the dedicated DB columns aren't populated yet.
 */

export interface ParsedShoe {
    modelName:   string;
    modelKey:    string;
    view:        string;
    colourLabel: string;
    colourKey:   string;
    salePrice:   number;
    realPrice:   number;
    isOnSale:    boolean;
}

const VIEW_KEYWORDS = [
    'SIDE VIEW','FRONT VIEW','BACK VIEW','LEFT VIEW','RIGHT VIEW',
    'TOP VIEW','DETAIL VIEW','SIZE VIEW','CORK MIDSOLE','SLIDE SHOW',
];

export function parsePrice(raw: string | number | null | undefined): number {
    if (raw === null || raw === undefined) return 0;
    const s = String(raw).replace(/[^0-9]/g, '');
    return s ? parseInt(s, 10) : 0;
}

export function normaliseKey(raw: string): string {
    return raw.replace(/_/g,' ').replace(/\s+/g,' ').trim().toUpperCase();
}

function toTitleCase(s: string): string {
    return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function extractView(text: string): string {
    const up = text.toUpperCase();
    for (const kw of VIEW_KEYWORDS) { if (up.includes(kw)) return kw; }
    return 'SIDE VIEW';
}

// ── Format A: parenthesis ─────────────────────────────────────────────────────

function parseFormatA(base: string): Partial<ParsedShoe> | null {
    const segs = [...base.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim());
    if (segs.length < 3) return null;

    const modelRaw = segs[0];
    const viewSeg  = segs.find(s => VIEW_KEYWORDS.some(v => s.toUpperCase().includes(v)));
    const realSeg  = segs.find(s => /REAL\s+PRICE/i.test(s));
    const saleSeg  = segs.find(s => /SALES?\s+PRICE/i.test(s));
    const sizeSeg  = segs.find(s => /^SIZE\s+\d/i.test(s));

    const classified = new Set([modelRaw, viewSeg, sizeSeg, realSeg, saleSeg].filter(Boolean));
    let colourRaw = segs.find(s => !classified.has(s) && !/^\s*SOLD\s*$/i.test(s)) ?? '';
    colourRaw = colourRaw.replace(/\bSOLD\b.*/i, '').trim();
    if (!colourRaw && segs.length > 2) colourRaw = segs[2];
    if (!colourRaw) return null;

    const realPrice  = parsePrice(realSeg ?? '');
    const salePrice  = parsePrice(saleSeg ?? '');
    const view       = viewSeg ? extractView(viewSeg) : 'SIDE VIEW';
    const modelKey   = normaliseKey(modelRaw);

    return {
        modelKey, modelName: toTitleCase(modelKey),
        view,
        colourKey:   colourRaw.toUpperCase().trim(),
        colourLabel: toTitleCase(colourRaw.trim()),
        salePrice:   salePrice || realPrice,
        realPrice:   realPrice || salePrice,
        isOnSale:    salePrice > 0 && realPrice > 0 && salePrice < realPrice,
    };
}

// ── Format B: R3500...R2500 ───────────────────────────────────────────────────

function parseFormatB(base: string): Partial<ParsedShoe> | null {
    const clean = base.replace(/\.\w{3,4}$/, '').replace(/\s*\(\d+\)\s*$/, '').trim();
    const pm    = clean.match(/R([\d,]+)\s*\.\.\.\s*R([\d,]+)/i);
    if (!pm) return null;

    const p1 = parsePrice(pm[1]), p2 = parsePrice(pm[2]);
    const realPrice = Math.max(p1, p2), salePrice = Math.min(p1, p2);
    const withoutPrices = clean.replace(/R[\d,]+\s*\.\.\.\s*R[\d,]+.*/i, '').trim();
    const words = withoutPrices.split(/\s+/);
    if (words.length < 2) return null;

    const modelRaw  = `${words[0]} ${words[1]}`;
    const colourRaw = words.slice(2).join(' ').replace(/\bSOLD\b.*/i, '').trim();
    const modelKey  = normaliseKey(modelRaw);

    return {
        modelKey, modelName: toTitleCase(modelKey),
        view:        extractView(withoutPrices),
        colourKey:   (colourRaw || 'DEFAULT').toUpperCase(),
        colourLabel: toTitleCase(colourRaw || 'Default'),
        salePrice, realPrice,
        isOnSale:    salePrice < realPrice,
    };
}

// ── Description pipe format ───────────────────────────────────────────────────

function parseDesc(description: string): Partial<ParsedShoe> | null {
    const parts = description.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const modelRaw  = parts[0];
    const colourRaw = (parts[2] ?? '').replace(/\bSOLD\b.*/i, '').trim();
    if (!colourRaw) return null;
    return {
        modelKey:    normaliseKey(modelRaw),
        modelName:   toTitleCase(normaliseKey(modelRaw)),
        view:        extractView(parts[1]),
        colourKey:   colourRaw.toUpperCase(),
        colourLabel: toTitleCase(colourRaw),
    };
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function parseShoeRow(row: {
    name: string;
    description?: string | null;
    price: string | number;
    original_price?: string | number | null;
    image_url: string;
}): ParsedShoe {
    let urlFilename = '';
    try { urlFilename = decodeURIComponent(row.image_url.split('/').pop() ?? ''); } catch { /**/ }

    const fromUrlA  = urlFilename ? parseFormatA(urlFilename) : null;
    const fromNameA = parseFormatA(row.name);
    const fromDesc  = row.description ? parseDesc(row.description) : null;
    const fromUrlB  = urlFilename ? parseFormatB(urlFilename) : null;

    const best = fromUrlA ?? fromNameA ?? fromDesc ?? fromUrlB;

    const dbSale = parsePrice(row.price);
    const dbReal = parsePrice(row.original_price);

    const modelKey  = normaliseKey(row.name);
    const salePrice = dbSale  || best?.salePrice || 0;
    const realPrice = dbReal  || best?.realPrice  || dbSale || 0;

    return {
        modelKey,
        modelName:   best?.modelName   ?? modelKey,
        view:        fromUrlA?.view    ?? fromDesc?.view  ?? fromUrlB?.view ?? 'SIDE VIEW',
        colourKey:   best?.colourKey   ?? 'DEFAULT',
        colourLabel: best?.colourLabel ?? 'Default',
        salePrice,
        realPrice,
        isOnSale: salePrice > 0 && realPrice > 0 && salePrice < realPrice,
    };
}

// ── Colour → CSS hex ──────────────────────────────────────────────────────────

const HEX: Record<string, string> = {
    BLACK:'#18181b', WHITE:'#f9fafb', CREAM:'#fef3c7', IVORY:'#fffff0',
    TAN:'#c4955a', CAMEL:'#c19a6b', BROWN:'#7c4b1e', CHOCOLATE:'#5a2d0c',
    NAVY:'#1e3a5f', BLUE:'#3b82f6', DENIM:'#1560bd', PRUSSIAN:'#003153',
    SAPPHIRE:'#0f52ba', RED:'#ef4444', MAGENTA:'#c0325c', BURGUNDY:'#800020',
    WINE:'#722f37', GREEN:'#16a34a', OLIVE:'#6b7c3a', GREY:'#9ca3af',
    GRAY:'#9ca3af', SILVER:'#d1d5db', GOLD:'#d4af37', BEIGE:'#e8d8b4',
    NUDE:'#e3c9a8', PEACH:'#ffcba4', PINK:'#f472b6', PURPLE:'#a855f7',
    ORANGE:'#f97316', YELLOW:'#facc15', SAND:'#c8b89a', STONE:'#b5a897',
    COGNAC:'#9f4a11', RUST:'#b7410e', TOFFEE:'#b5651d', SUEDE:'#a87c5a',
    NUBUCK:'#c4a882', LEATHER:'#8b6344', MIX:'#94a3b8', FUR:'#d4c5b2',
};

export function colourToHex(colourKey: string): string {
    const words = colourKey.toUpperCase().split(/[\s_]+/);
    for (const w of words) { if (HEX[w]) return HEX[w]; }
    return '#d1d5db';
}