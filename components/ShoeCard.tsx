"use client";

import { useState, useEffect, Suspense } from 'react';
import { useStore } from '@/lib/store';
import type { ModelGroup } from '@/lib/Groupshoes';

function CardContent({ group }: { group: ModelGroup }) {
    const addToCart = useStore((s) => s.addToCart);
    const [viewIdx, setViewIdx] = useState(0);
    const [colourIdx, setColourIdx] = useState(0);
    const [added, setAdded] = useState(false);

    const variant = group.variants[colourIdx];
    if (!variant) return null;

    const views = variant.views;
    const currentView = views[viewIdx] ?? views[0];

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({
            id: currentView?.id ?? String(Date.now()),
            name: `${group.modelName} – ${variant.colourLabel}`,
            price: variant.salePrice,
            image_url: currentView?.imageUrl ?? '',
        } as any);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="group flex flex-col h-full bg-white transition-all duration-700">
            {/* ── STUDIO GALLERY ── */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] mb-6">
                {views.map((v, i) => (
                    <img
                        key={v.id}
                        src={v.imageUrl}
                        alt={group.modelName}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-contain p-10 transition-all duration-1000 ease-in-out ${
                            i === viewIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        }`}
                    />
                ))}

                {/* Invisible Navigation Zones */}
                <div className="absolute inset-0 z-10 flex">
                    <div
                        className="w-1/2 cursor-w-resize"
                        onClick={() => setViewIdx(prev => (prev - 1 + views.length) % views.length)}
                    />
                    <div
                        className="w-1/2 cursor-e-resize"
                        onClick={() => setViewIdx(prev => (prev + 1) % views.length)}
                    />
                </div>

                {/* Minimalist Status Indicator */}
                <div className="absolute top-6 right-6 z-20">
                    <span className="bg-white px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.25em] shadow-sm border border-zinc-100">
                        {variant.stock > 0 ? "• Available" : "• Sold Out"}
                    </span>
                </div>

                {/* Mobile View Counter */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {views.map((_, i) => (
                        <div
                            key={i}
                            className={`h-[2px] transition-all duration-500 ${
                                i === viewIdx ? 'w-4 bg-zinc-900' : 'w-1 bg-zinc-300'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* ── PRODUCT META ── */}
            <div className="px-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 leading-none">
                            {variant.brand}
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-tight text-zinc-900">
                            {group.modelName}
                        </p>
                        <p className="text-[9px] font-medium text-zinc-400 capitalize">
                            {variant.colourLabel}
                        </p>
                    </div>
                    <p className="text-xs font-black text-zinc-900">
                        R{variant.salePrice}
                    </p>
                </div>

                {/* Interactive Elements */}
                <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="flex gap-2.5">
                        {group.variants.map((v, i) => (
                            <button
                                key={v.colourKey}
                                onClick={(e) => { e.stopPropagation(); setColourIdx(i); setViewIdx(0); }}
                                className={`w-3.5 h-3.5 rounded-full border border-zinc-200 transition-all ${
                                    i === colourIdx ? 'scale-125 border-zinc-900 ring-1 ring-zinc-900 ring-offset-2' : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: v.colourHex }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleAdd}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all py-2 px-4 rounded-full border ${
                            added ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-zinc-900 border-zinc-200 hover:bg-black hover:text-white hover:border-black'
                        }`}
                    >
                        {added ? 'In Bag' : 'Add To Bag'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ShoeCard({ group }: { group: ModelGroup }) {
    return (
        <Suspense fallback={<div className="aspect-[3/4] bg-[#F9F9F9] animate-pulse" />}>
            <CardContent group={group} />
        </Suspense>
    );
}