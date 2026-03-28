/**
 * lib/groupShoes.ts
 *
 * Groups Supabase rows using the dedicated columns written by the sync route:
 *   name         → model grouping key
 *   color_label  → colour variant grouping (falls back to parsing description)
 *   view_type    → which angle this image shows
 *   variant_slug → stable slug per model+colour combo
 *
 * Output tree:
 *   ModelGroup[]
 *     └─ ColourVariant[]   (one per unique color_label within a model)
 *           └─ ShoeView[]  (one per view_type for that colour)
 */

import { colourToHex, normaliseKey, parseShoeRow } from './parseShoe';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ShoeView {
    id:       string;
    view:     string;    // "SIDE VIEW", "FRONT VIEW", etc.
    imageUrl: string;
}

export interface ColourVariant {
    colourKey:   string;
    colourLabel: string;
    colourHex:   string;
    variantSlug: string;
    salePrice:   number;
    realPrice:   number;
    isOnSale:    boolean;
    stock:       number;
    status:      string | null;
    brand:       string;
    category:    string;
    views:       ShoeView[];
}

export interface ModelGroup {
    modelKey:  string;
    modelName: string;
    variants:  ColourVariant[];
}

// Raw row shape from Supabase (all columns)
export interface RawShoe {
    id:             string;
    name:           string;
    brand:          string;
    price:          string | number;
    original_price?: string | number | null;
    image_url:      string;
    description?:   string | null;
    size?:          string | null;
    stock:          number;
    status?:        string | null;
    category?:      string | null;
    // New columns (present after migration.sql)
    color_label?:   string | null;
    view_type?:     string | null;
    variant_slug?:  string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VIEW_ORDER = [
    'FRONT VIEW','SIDE VIEW','LEFT VIEW','RIGHT VIEW',
    'BACK VIEW','TOP VIEW','CORK MIDSOLE','DETAIL VIEW','SIZE VIEW',
];

function viewSort(v: string) {
    const i = VIEW_ORDER.indexOf(v.toUpperCase());
    return i === -1 ? 99 : i;
}

function isHeroRow(row: RawShoe): boolean {
    const nameNorm = row.name.toUpperCase().replace(/_/g,' ').trim();
    const desc     = (row.description ?? '').toUpperCase();
    const sale     = parseFloat(String(row.price         ?? 0));
    const real     = parseFloat(String(row.original_price ?? 0));
    return (
        nameNorm === 'FRONT DISPLAY' ||
        desc.includes('SLIDE SHOW')  ||
        nameNorm.includes('SLIDE SHOW') ||
        (sale === 0 && real === 0)
    );
}

function parseNum(v: string | number | null | undefined): number {
    if (v === null || v === undefined) return 0;
    const s = String(v).replace(/[^0-9]/g, '');
    return s ? parseInt(s, 10) : 0;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function groupShoes(rows: RawShoe[]): {
    groups:     ModelGroup[];
    heroImages: string[];
} {
    const heroImages: string[] = [];

    // modelKey → colourKey → entry
    type Entry = { meta: Omit<ColourVariant,'views'>; views: ShoeView[] };
    const modelMap   = new Map<string, Map<string, Entry>>();
    const modelNames = new Map<string, string>();

    for (const row of rows) {
        // ── Separate hero/display images ────────────────────────────────────────
        if (isHeroRow(row)) {
            heroImages.push(row.image_url);
            continue;
        }

        // ── Determine model key ─────────────────────────────────────────────────
        // Use the `name` column as the model grouping key (normalised).
        const modelKey = normaliseKey(row.name);

        // ── Determine colour ────────────────────────────────────────────────────
        // Priority: color_label column → description parse → image URL parse
        let colourLabel = (row.color_label ?? '').trim();
        let view        = (row.view_type  ?? '').trim().toUpperCase() || 'SIDE VIEW';
        let variantSlug = (row.variant_slug ?? '').trim();

        if (!colourLabel || colourLabel === 'Default') {
            // Fall back to full parse (description / image URL)
            const p   = parseShoeRow(row);
            colourLabel = p.colourLabel;
            if (!view || view === 'SIDE VIEW') view = p.view;
            if (!variantSlug) variantSlug = `${modelKey}-${colourLabel}`.toLowerCase().replace(/\s+/g,'-');
            if (!modelNames.has(modelKey)) modelNames.set(modelKey, p.modelName);
        } else {
            if (!modelNames.has(modelKey)) {
                // Build display name from model key
                const p = parseShoeRow(row);
                modelNames.set(modelKey, p.modelName);
            }
        }

        const colourKey = colourLabel.toUpperCase().trim();

        // ── Prices ──────────────────────────────────────────────────────────────
        const salePrice = parseNum(row.price);
        const realPrice = parseNum(row.original_price) || salePrice;
        const isOnSale  = salePrice > 0 && realPrice > salePrice;

        // ── Build map ────────────────────────────────────────────────────────────
        if (!modelMap.has(modelKey)) modelMap.set(modelKey, new Map());
        const colMap = modelMap.get(modelKey)!;

        if (!colMap.has(colourKey)) {
            colMap.set(colourKey, {
                meta: {
                    colourKey,
                    colourLabel,
                    colourHex:   colourToHex(colourKey),
                    variantSlug: variantSlug || `${modelKey}-${colourKey}`.toLowerCase().replace(/\s+/g,'-'),
                    salePrice,
                    realPrice,
                    isOnSale,
                    stock:    row.stock ?? 10,
                    status:   row.status ?? null,
                    brand:    row.brand  ?? 'ZIKIANO',
                    category: row.category ?? '',
                },
                views: [],
            });
        }

        // ── Add view (deduplicate by view label) ─────────────────────────────────
        const entry = colMap.get(colourKey)!;
        const dupView = entry.views.some(v => v.view === view);
        if (!dupView) {
            entry.views.push({ id: String(row.id), view, imageUrl: row.image_url });
        }
    }

    // ── Assemble groups ─────────────────────────────────────────────────────────
    const groups: ModelGroup[] = [];

    for (const [modelKey, colMap] of modelMap.entries()) {
        const variants: ColourVariant[] = [...colMap.values()].map(({ meta, views }) => ({
            ...meta,
            views: [...views].sort((a,b) => viewSort(a.view) - viewSort(b.view)),
        }));

        groups.push({
            modelKey,
            modelName: modelNames.get(modelKey) ?? modelKey,
            variants,
        });
    }

    groups.sort((a,b) => a.modelName.localeCompare(b.modelName));

    return { groups, heroImages };
}