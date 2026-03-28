"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import type { ModelGroup, ColourVariant } from '@/lib/Groupshoes';

/** --- CONSTANTS & TYPES --- */
const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
type AvailStatus = 'available' | 'instore' | 'on_request' | 'sold_out';

const STATUS_CFG: Record<AvailStatus, { label: string; bg: string; text: string; dot: string }> = {
    available: { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    instore: { label: 'In Store', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
    on_request: { label: 'On Request', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    sold_out: { label: 'Sold Out', bg: 'bg-zinc-100', text: 'text-zinc-500', dot: 'bg-zinc-400' },
};

function deriveStatus(v: ColourVariant): AvailStatus {
    if (v.status) return v.status as AvailStatus;
    return v.stock === 0 ? 'sold_out' : 'available';
}

/** --- SUB-COMPONENTS --- */
function StatusBadge({ status }: { status: AvailStatus }) {
    const c = STATUS_CFG[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest backdrop-blur-sm ${c.bg} ${c.text}`}>
            <span className={`w-1 h-1 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function ColourDot({ variant, selected, onClick }: { variant: ColourVariant; selected: boolean; onClick: () => void; }) {
    const soldOut = deriveStatus(variant) === 'sold_out';
    return (
        <button onClick={onClick} className={`relative flex-shrink-0 rounded-full border-2 transition-all w-5 h-5 sm:w-6 sm:h-6 ${selected ? 'border-zinc-900 scale-110 shadow-md' : 'border-zinc-100'} ${soldOut ? 'opacity-30' : ''}`} style={{ backgroundColor: variant.colourHex }}>
            {soldOut && <span className="absolute inset-0 flex items-center justify-center"><span className="block w-px h-full bg-zinc-400 rotate-45" /></span>}
        </button>
    );
}

/** --- MAIN CARD CONTENT --- */
function ShoeCardContent({ group }: { group: ModelGroup }) {
    const addToCart = useStore((s) => s.addToCart);
    const [mounted, setMounted] = useState(false);
    const [colourIdx, setColourIdx] = useState(0);
    const [viewIdx, setViewIdx] = useState(0);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [swatchOpen, setSwatchOpen] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const variant = group.variants[colourIdx];
    if (!variant) return null;

    const status = deriveStatus(variant);
    const views = variant.views;
    const currentView = views[viewIdx] ?? views[0];

    const handleAdd = () => {
        if (!selectedSize) return alert("Please select a size");
        addToCart({
            id: currentView?.id ?? String(Date.now()),
            name: `${group.modelName} - ${variant.colourLabel}`,
            price: variant.salePrice,
            image_url: currentView?.imageUrl ?? '',
        } as any);
        setAdded(true); setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="group/card bg-white rounded-2xl overflow-hidden border border-zinc-100 flex flex-col h-full shadow-sm">

            {/* ── IMAGE SECTION: Optimized for Small Mobile View ── */}
            <div className="aspect-[4/5] bg-zinc-50 relative overflow-hidden touch-none">
                {views.map((v, i) => (
                    <img
                        key={v.id}
                        src={v.imageUrl}
                        alt={group.modelName}
                        // p-6 ensures the image stays small and centered on mobile
                        className="absolute inset-0 w-full h-full object-contain p-6 transition-all duration-500"
                        style={{ opacity: i === viewIdx ? 1 : 0, zIndex: i === viewIdx ? 10 : 0 }}
                    />
                ))}

                {/* Mobile Tap Zones: Fixed "Black Block" Issue */}
                <div className="absolute inset-0 z-20 flex sm:hidden">
                    <div className="w-1/2 h-full bg-transparent" onClick={() => setViewIdx(i => (i - 1 + views.length) % views.length)} />
                    <div className="w-1/2 h-full bg-transparent" onClick={() => setViewIdx(i => (i + 1) % views.length)} />
                </div>

                <div className="absolute top-2 right-2 z-30">
                    <StatusBadge status={status} />
                </div>

                {/* View Indicator */}
                <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-1">
                    {views.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all ${i === viewIdx ? 'w-4 bg-black' : 'w-1 bg-zinc-300'}`} />
                    ))}
                </div>
            </div>

            {/* ── INFO SECTION ── */}
            <div className="p-3 sm:p-4 flex flex-col flex-grow gap-3">
                <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 leading-none">{variant.brand}</p>
                    <h3 className="text-xs sm:text-sm font-black text-zinc-900 uppercase tracking-tight line-clamp-1">{group.modelName}</h3>
                </div>

                {/* Mobile Colour Picker */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {group.variants.map((v, i) => (
                        <ColourDot key={v.colourKey} variant={v} selected={i === colourIdx} onClick={() => {setColourIdx(i); setViewIdx(0);}} />
                    ))}
                </div>

                {/* Size Grid: Compact for Mobile */}
                <div className="grid grid-cols-5 gap-1">
                    {SIZES.slice(4, 14).map((s) => (
                        <button key={s} onClick={() => setSelectedSize(s)}
                                className={`py-1.5 rounded text-[9px] font-bold transition-all ${selectedSize === s ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}>
                            {s}
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-2 border-t border-zinc-50 flex items-center justify-between">
                    <span className="font-black text-sm text-zinc-900">R{variant.salePrice}</span>
                    <button
                        onClick={handleAdd}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${added ? 'bg-emerald-500 text-white' : 'bg-black text-white active:scale-95'}`}>
                        {added ? 'Added' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ShoeCard({ group }: { group: ModelGroup }) {
    return (
        <Suspense fallback={<div className="aspect-[4/5] bg-zinc-100 animate-pulse rounded-2xl" />}>
            <ShoeCardContent group={group} />
        </Suspense>
    );
}