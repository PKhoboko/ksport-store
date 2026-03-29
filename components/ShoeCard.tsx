"use client";

import { useState, Suspense } from 'react';
import { useStore } from '@/lib/store';
import type { ModelGroup } from '@/lib/Groupshoes';

const SIZES = [6,7,8,9,10,11,12,13,14,15];

/** Deterministic price formatter — avoids hydration mismatch */
function fmtPrice(n: number): string {
    return 'R\u00a0' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function CardContent({ group }: { group: ModelGroup }) {
    const addToCart = useStore((s) => s.addToCart);
    const [viewIdx, setViewIdx]           = useState(0);
    const [colourIdx, setColourIdx]       = useState(0);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [sizeOpen, setSizeOpen]         = useState(false);
    const [sizeError, setSizeError]       = useState(false);
    const [added, setAdded]               = useState(false);

    const variant = group.variants[colourIdx];
    if (!variant) return null;

    const views       = variant.views;
    const currentView = views[viewIdx] ?? views[0];

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedSize) {
            setSizeError(true);
            setSizeOpen(true);
            setTimeout(() => setSizeError(false), 2000);
            return;
        }
        addToCart({
            id:        currentView?.id ?? String(Date.now()),
            name:      `${group.modelName} – ${variant.colourLabel} – Size ${selectedSize}`,
            price:     variant.salePrice,
            image_url: currentView?.imageUrl ?? '',
        } as any);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="group flex flex-col h-full bg-white border border-zinc-100 hover:shadow-xl transition-all duration-500 overflow-hidden rounded-sm">

            {/* ── IMAGE ── */}
            {/*
              Mobile:  aspect-[4/3] landscape — shorter so two cards fit on screen
                       without scrolling, images still look great
              Desktop: aspect-square — equal proportions, editorial feel
            */}
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-zinc-100">

                {views.map((v, i) => (
                    <img
                        key={v.id}
                        src={v.imageUrl}
                        alt={group.modelName}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                            i === viewIdx
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 scale-95'
                        }`}
                    />
                ))}

                {/* Tap zones — left = prev, right = next */}
                {views.length > 1 && (
                    <div className="absolute inset-0 z-10 flex">
                        <div className="w-1/2 cursor-w-resize"
                             onClick={() => setViewIdx(p => (p - 1 + views.length) % views.length)} />
                        <div className="w-1/2 cursor-e-resize"
                             onClick={() => setViewIdx(p => (p + 1) % views.length)} />
                    </div>
                )}

                {/* Status badge — smaller on mobile */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
                    <span className={`
                        px-2 py-0.5 sm:px-2.5 sm:py-1
                        text-[6px] sm:text-[7px]
                        font-black uppercase tracking-[0.2em]
                        bg-white shadow-sm border border-zinc-100
                        ${variant.stock === 0 ? 'text-red-400' : 'text-zinc-600'}
                    `}>
                        {variant.stock > 0 ? '• Available' : '• Sold Out'}
                    </span>
                </div>

                {/* View pips — only shown if multiple views */}
                {views.length > 1 && (
                    <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center gap-1 z-20">
                        {views.map((_, i) => (
                            <div key={i} className={`h-[2px] transition-all duration-500 ${
                                i === viewIdx
                                    ? 'w-3 sm:w-4 bg-zinc-900'
                                    : 'w-1 bg-zinc-300'
                            }`} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── META ── */}
            {/*
              Mobile: tighter padding, smaller text — card is half screen width
              Desktop: generous padding, full text sizes
            */}
            <div className="px-2.5 pb-3 pt-2.5 sm:px-4 sm:pb-5 sm:pt-4 flex flex-col gap-2 sm:gap-3">

                {/* Brand / Name / Colour + Price */}
                <div className="flex justify-between items-start gap-1">
                    <div className="min-w-0">
                        <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none">
                            {variant.brand}
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-zinc-900 mt-0.5 truncate">
                            {group.modelName}
                        </p>
                        <p className="text-[8px] sm:text-[9px] font-medium text-zinc-400 capitalize mt-0.5 truncate">
                            {variant.colourLabel}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[10px] sm:text-xs font-black text-zinc-900">
                            {fmtPrice(variant.salePrice)}
                        </p>
                        {variant.isOnSale && variant.realPrice > variant.salePrice && (
                            <p className="text-[7px] sm:text-[8px] text-zinc-400 line-through">
                                {fmtPrice(variant.realPrice)}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── SIZE DROPDOWN ── */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSizeOpen(o => !o); }}
                        className={`
                            w-full flex items-center justify-between
                            px-2 py-1.5 sm:px-3 sm:py-2
                            border text-[7px] sm:text-[9px] font-black uppercase tracking-[0.15em]
                            transition-all duration-200
                            ${sizeError
                            ? 'border-red-400 text-red-500 bg-red-50'
                            : selectedSize
                                ? 'border-zinc-900 text-zinc-900 bg-white'
                                : 'border-zinc-200 text-zinc-400 bg-white hover:border-zinc-500'
                        }
                        `}
                    >
                        <span>
                            {sizeError
                                ? 'Pick a size'
                                : selectedSize
                                    ? `Size ${selectedSize} (UK/SA)`
                                    : 'Size (UK/SA)'}
                        </span>
                        <span className={`text-[9px] sm:text-[11px] transition-transform duration-200 ${sizeOpen ? 'rotate-180' : ''}`}>
                            ▾
                        </span>
                    </button>

                    {/* Dropdown — opens upward */}
                    {sizeOpen && (
                        <div
                            className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-zinc-200 shadow-2xl z-30 p-1.5 sm:p-2"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="grid grid-cols-5 gap-1">
                                {SIZES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setSelectedSize(s); setSizeOpen(false); setSizeError(false); }}
                                        className={`
                                            py-1 sm:py-1.5
                                            text-[8px] sm:text-[9px] font-black tracking-wide
                                            transition-all duration-150
                                            ${selectedSize === s
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-900 hover:text-white'
                                        }
                                        `}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[7px] sm:text-[8px] text-zinc-400 text-center mt-1.5 tracking-widest uppercase">
                                UK / SA Sizing
                            </p>
                        </div>
                    )}
                </div>

                {/* Colour swatches + Add to Bag */}
                <div className="flex items-center justify-between gap-2">

                    {/* Swatches — smaller dots on mobile */}
                    <div className="flex gap-1.5 sm:gap-2.5 flex-wrap">
                        {group.variants.map((v, i) => (
                            <button
                                key={v.colourKey}
                                title={v.colourLabel}
                                onClick={(e) => { e.stopPropagation(); setColourIdx(i); setViewIdx(0); }}
                                className={`
                                    w-3 h-3 sm:w-3.5 sm:h-3.5
                                    rounded-full border border-zinc-200 transition-all
                                    ${i === colourIdx
                                    ? 'scale-125 border-zinc-900 ring-1 ring-zinc-900 ring-offset-1 sm:ring-offset-2'
                                    : 'hover:scale-110'
                                }
                                `}
                                style={{ backgroundColor: v.colourHex }}
                            />
                        ))}
                    </div>

                    {/* Add to bag — compact on mobile */}
                    <button
                        onClick={handleAdd}
                        className={`
                            shrink-0 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]
                            text-[7px] sm:text-[9px]
                            py-1.5 px-2.5 sm:py-2 sm:px-4
                            rounded-full border transition-all duration-200
                            ${added
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-white text-zinc-900 border-zinc-200 hover:bg-black hover:text-white hover:border-black active:scale-95'
                        }
                        `}
                    >
                        {added ? '✓ Added' : 'Add to Bag'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ShoeCard({ group }: { group: ModelGroup }) {
    return (
        <Suspense fallback={
            <div className="flex flex-col overflow-hidden rounded-sm border border-zinc-100">
                <div className="aspect-[4/3] sm:aspect-square bg-zinc-100 animate-pulse" />
                <div className="p-3 space-y-2">
                    <div className="h-2 bg-zinc-100 rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-zinc-100 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-zinc-100 rounded animate-pulse w-1/3" />
                </div>
            </div>
        }>
            <CardContent group={group} />
        </Suspense>
    );
}