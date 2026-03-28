"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ModelGroup, ColourVariant } from '@/lib/Groupshoes';

/** * --- CONSTANTS & TYPES ---
 */
const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

type AvailStatus = 'available' | 'instore' | 'on_request' | 'sold_out';

const STATUS_CFG: Record<AvailStatus, { label: string; bg: string; text: string; dot: string }> = {
    available: { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    instore: { label: 'In Store', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
    on_request: { label: 'On Request', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    sold_out: { label: 'Sold Out', bg: 'bg-zinc-100', text: 'text-zinc-500', dot: 'bg-zinc-400' },
};

/** * --- HELPER COMPONENTS ---
 */
function deriveStatus(v: ColourVariant): AvailStatus {
    if (v.status) return v.status as AvailStatus;
    if (v.stock === 0) return 'sold_out';
    return 'available';
}

function StatusBadge({ status }: { status: AvailStatus }) {
    const c = STATUS_CFG[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-sm ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
            {c.label}
        </span>
    );
}

function ViewPips({ total, current, onChange }: { total: number; current: number; onChange: (i: number) => void }) {
    if (total <= 1) return null;
    return (
        <div className="flex gap-1 justify-center">
            {Array.from({ length: total }).map((_, i) => (
                <button key={i} onClick={() => onChange(i)} aria-label={`View ${i + 1}`}
                        className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5 h-1.5' : 'bg-white/40 w-1.5 h-1.5 hover:bg-white/70'
                        }`} />
            ))}
        </div>
    );
}

function ColourDot({ variant, selected, onClick }: {
    variant: ColourVariant; selected: boolean; onClick: () => void;
}) {
    const soldOut = deriveStatus(variant) === 'sold_out';
    return (
        <button onClick={onClick} title={variant.colourLabel} aria-label={variant.colourLabel}
                className={`
        relative flex-shrink-0 rounded-full border-2 transition-all duration-200
        w-5 h-5 sm:w-6 sm:h-6
        ${selected ? 'border-zinc-900 scale-125 shadow-lg ring-2 ring-white ring-offset-1'
                    : 'border-zinc-200 hover:border-zinc-500 hover:scale-110 shadow-sm'}
        ${soldOut ? 'opacity-35' : ''}
      `}
                style={{ backgroundColor: variant.colourHex }}>
            {soldOut && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden pointer-events-none">
                    <span className="block w-px h-full bg-zinc-600/60 rotate-45 absolute" />
                </span>
            )}
        </button>
    );
}

function Price({ variant, mounted }: { variant: ColourVariant; mounted: boolean }) {
    const fmt = (n: number) =>
        new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n);

    if (!mounted) return <span className="font-black text-xl sm:text-2xl text-zinc-900">R{variant.salePrice}</span>;

    if (variant.isOnSale && variant.realPrice > 0) {
        return (
            <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-black text-xl sm:text-2xl text-zinc-900">{fmt(variant.salePrice)}</span>
                <span className="text-sm text-zinc-400 line-through font-medium">{fmt(variant.realPrice)}</span>
                <span className="text-[8px] font-black uppercase tracking-wide text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    Save {fmt(variant.realPrice - variant.salePrice)}
                </span>
            </div>
        );
    }
    return <span className="font-black text-xl sm:text-2xl text-zinc-900">{fmt(variant.salePrice)}</span>;
}

/** * --- MAIN CONTENT COMPONENT ---
 */
function ShoeCardContent({ group }: { group: ModelGroup }) {
    const addToCart = useStore((s) => s.addToCart);
    const [mounted, setMounted] = useState(false);
    const [colourIdx, setColourIdx] = useState(0);
    const [viewIdx, setViewIdx] = useState(0);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [swatchOpen, setSwatchOpen] = useState(false);
    const [sizeError, setSizeError] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const switchColour = useCallback((idx: number) => {
        setColourIdx(idx); setViewIdx(0); setSwatchOpen(false);
    }, []);

    if (!group.variants.length) return null;

    const variant = group.variants[colourIdx];
    const status = deriveStatus(variant);
    const views = variant.views;
    const currentView = views[viewIdx] ?? views[0];
    const canBuy = status === 'available' || status === 'instore';
    const onRequest = status === 'on_request';
    const lowStock = status === 'available' && variant.stock > 0 && variant.stock < 3;

    const handleAdd = () => {
        if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 1800); return; }
        addToCart({
            id: currentView?.id ?? String(Date.now()),
            name: `${group.modelName} – ${variant.colourLabel} – Size ${selectedSize}`,
            brand: variant.brand,
            price: variant.salePrice,
            stock: variant.stock,
            image_url: currentView?.imageUrl ?? '',
        } as any);
        setAdded(true); setTimeout(() => setAdded(false), 2200);
    };

    const prevView = () => setViewIdx((i) => (i - 1 + views.length) % views.length);
    const nextView = () => setViewIdx((i) => (i + 1) % views.length);

    return (
        <div className="group/card bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-100
                    transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-200/60 flex flex-col h-full">

            {/* ── IMAGE SECTION (Fixed for Mobile Cutting) ── */}
            <div className="aspect-[4/5] overflow-hidden bg-zinc-50 relative select-none">
                {views.map((v, i) => (
                    <img key={v.id} src={v.imageUrl}
                         alt={`${group.modelName} ${variant.colourLabel} – ${v.view}`}
                         loading="lazy"
                        // Changed to object-contain and added padding (p-4) to prevent cropping
                         className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 ease-in-out group-hover/card:scale-105"
                         style={{
                             opacity: i === viewIdx ? 1 : 0,
                             filter: i === viewIdx ? 'none' : 'blur(8px)',
                             transform: i === viewIdx ? 'scale(1)' : 'scale(1.04)',
                             zIndex: i === viewIdx ? 1 : 0,
                         }} />
                ))}

                {/* View label */}
                {currentView && (
                    <div className="absolute bottom-9 left-0 right-0 flex justify-center z-10 pointer-events-none">
                        <span className="text-[7px] font-black uppercase tracking-[0.18em] bg-black/45 text-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            {currentView.view}
                        </span>
                    </div>
                )}

                {/* View pips */}
                <div className="absolute bottom-2.5 left-0 right-0 z-10 flex justify-center">
                    <ViewPips total={views.length} current={viewIdx} onChange={setViewIdx} />
                </div>

                {/* Mobile tap zones */}
                {views.length > 1 && <>
                    <button aria-label="Previous view" onClick={prevView}
                            className="absolute left-0 top-0 h-full w-2/5 z-10 sm:hidden" />
                    <button aria-label="Next view" onClick={nextView}
                            className="absolute right-0 top-0 h-full w-2/5 z-10 sm:hidden" />
                </>}

                {/* Desktop hover arrows */}
                {views.length > 1 && <>
                    <button onClick={prevView} aria-label="Previous view"
                            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm items-center justify-center shadow text-zinc-700 text-lg opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-white">‹</button>
                    <button onClick={nextView} aria-label="Next view"
                            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm items-center justify-center shadow text-zinc-700 text-lg opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-white">›</button>
                </>}

                {lowStock && (
                    <div className="absolute top-2 left-2 z-20">
                        <span className="text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-amber-500 text-white shadow">Low Stock</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 z-20">
                    <StatusBadge status={status} />
                </div>
            </div>

            {/* ── BODY SECTION ── */}
            <div className="p-3 sm:p-5 flex flex-col flex-grow gap-2.5 sm:gap-3">
                <div>
                    <p className="text-[7px] sm:text-[9px] font-black tracking-[0.3em] text-zinc-400 uppercase leading-none">{variant.brand}</p>
                    <h3 className="text-[13px] sm:text-[17px] font-black leading-tight text-zinc-900 tracking-tight mt-1 line-clamp-2">{group.modelName}</h3>
                    <p className="text-[9px] sm:text-[11px] text-zinc-500 capitalize mt-0.5 leading-none font-medium">{variant.colourLabel}</p>
                </div>

                {/* Swatches — mobile collapsed */}
                <div className="sm:hidden">
                    <button onClick={() => setSwatchOpen(o => !o)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-zinc-200 text-[8px] font-bold uppercase tracking-widest text-zinc-500 active:bg-zinc-50 transition-all">
                        <span className="w-3 h-3 rounded-full border border-zinc-300 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: variant.colourHex }} />
                        {group.variants.length} colour{group.variants.length !== 1 ? 's' : ''}
                        <span className="text-zinc-300 text-[7px]">{swatchOpen ? '▲' : '▼'}</span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${swatchOpen ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-wrap gap-2">
                            {group.variants.map((v, i) => (
                                <ColourDot key={v.colourKey} variant={v} selected={i === colourIdx} onClick={() => switchColour(i)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Swatches — desktop */}
                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Colours</span>
                    {group.variants.map((v, i) => (
                        <ColourDot key={v.colourKey} variant={v} selected={i === colourIdx} onClick={() => switchColour(i)} />
                    ))}
                    {group.variants.length === 1 && (
                        <span title="More colours coming soon"
                              className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 text-[11px] cursor-default">+</span>
                    )}
                </div>

                {/* Size picker */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Size <span className="font-medium text-zinc-400">(UK/SA)</span>
                        </span>
                        {sizeError && <span className="text-[8px] font-black text-red-500 animate-pulse">Select a size</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {SIZES.map((s) => (
                            <button key={s} onClick={() => { setSelectedSize(s); setSizeError(false); }}
                                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[8px] sm:text-[9px] font-black
                  transition-all duration-150 flex items-center justify-center
                  ${selectedSize === s ? 'bg-zinc-900 text-white shadow-md scale-110'
                                        : sizeError ? 'bg-red-50 text-red-400 ring-1 ring-red-300'
                                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 active:scale-95'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex flex-col gap-2 pt-1">
                    <Price variant={variant} mounted={mounted} />

                    {canBuy && (
                        <button onClick={handleAdd}
                                className={`w-full py-2.5 sm:py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black
                uppercase tracking-[0.18em] transition-all duration-300 shadow-md active:scale-[0.97]
                ${added ? 'bg-emerald-600 text-white shadow-emerald-200'
                                    : 'bg-zinc-900 text-white hover:bg-zinc-700 shadow-zinc-200'}`}>
                            {added ? '✓ Added to Bag' : 'Add to Bag'}
                        </button>
                    )}
                    {onRequest && (
                        <button onClick={() => alert(`Enquire about ${group.modelName} – ${variant.colourLabel}`)}
                                className="w-full py-2.5 sm:py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.97] shadow-md shadow-amber-100 transition-all duration-300">
                            Request This Shoe
                        </button>
                    )}
                    {status === 'sold_out' && (
                        <div className="w-full py-2.5 sm:py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-center bg-zinc-100 text-zinc-400 cursor-not-allowed select-none">
                            Sold Out
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/** * --- EXPORT WITH SUSPENSE ---
 */
export default function ShoeCard({ group }: { group: ModelGroup }) {
    return (
        <Suspense fallback={
            <div className="w-full aspect-[4/5] bg-zinc-100 animate-pulse rounded-3xl flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Loading Zikiano...</span>
            </div>
        }>
            <ShoeCardContent group={group} />
        </Suspense>
    );
}