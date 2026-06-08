"use client";

import { Suspense, useEffect, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, X, ZoomIn } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ModelGroup } from "@/lib/Groupshoes";

const SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function fmtPrice(n: number): string {
    return "R " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function CardContent({ group }: { group: ModelGroup }) {
    const addToCart = useStore((s) => s.addToCart);
    const [viewIdx, setViewIdx] = useState(0);
    const [colourIdx, setColourIdx] = useState(0);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [sizeOpen, setSizeOpen] = useState(false);
    const [sizeError, setSizeError] = useState(false);
    const [added, setAdded] = useState(false);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);

    const variant = group.variants[colourIdx];
    const views = variant?.views ?? [];
    const currentView = views[viewIdx] ?? views[0];
    const isSoldOut = variant?.stock === 0;

    useEffect(() => {
        if (!zoomOpen || views.length === 0) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setZoomOpen(false);
            if (event.key === "ArrowLeft") setViewIdx((p) => (p - 1 + views.length) % views.length);
            if (event.key === "ArrowRight") setViewIdx((p) => (p + 1) % views.length);
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [zoomOpen, views.length]);

    if (!variant) return null;

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSoldOut) return;
        if (!selectedSize) {
            setSizeError(true);
            setSizeOpen(true);
            setTimeout(() => setSizeError(false), 1800);
            return;
        }

        addToCart({
            id: currentView?.id ?? String(Date.now()),
            name: `${group.modelName} - ${variant.colourLabel} - Size ${selectedSize}`,
            price: variant.salePrice,
            image_url: currentView?.imageUrl ?? "",
            brand: variant.brand,
            stock: variant.stock,
            description: variant.category,
            category: variant.category,
            sizes: [selectedSize],
        } as any);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden bg-white">
            <div className="relative aspect-[4/5] overflow-hidden bg-zikiano-stone">
                {views.map((v, i) => (
                    <img
                        key={v.id}
                        src={v.imageUrl}
                        alt={`${group.modelName} ${variant.colourLabel}`}
                        loading="lazy"
                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                            i === viewIdx ? "scale-100 opacity-100" : "scale-105 opacity-0"
                        }`}
                    />
                ))}

                {views.length > 1 && (
                    <div className="absolute inset-0 z-10 flex">
                        <button
                            type="button"
                            className="h-full w-1/2 bg-transparent"
                            onClick={() => setViewIdx((p) => (p - 1 + views.length) % views.length)}
                            aria-label="Previous product image"
                        />
                        <button
                            type="button"
                            className="h-full w-1/2 bg-transparent"
                            onClick={() => setViewIdx((p) => (p + 1) % views.length)}
                            aria-label="Next product image"
                        />
                    </div>
                )}

                <div className="absolute left-3 top-3 z-20 flex gap-2">
                    <span className="bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-black shadow-sm">
                        {isSoldOut ? "Sold out" : "Available"}
                    </span>
                    {variant.isOnSale && (
                        <span className="bg-zikiano-signal px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-black shadow-sm">
                            Sale
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setZoomScale(1);
                        setZoomOpen(true);
                    }}
                    className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-zikiano-signal"
                    aria-label="Zoom product image"
                    title="Zoom product image"
                >
                    <ZoomIn size={18} />
                </button>

                {views.length > 1 && (
                    <div className="absolute bottom-3 left-3 right-3 z-20 flex gap-1">
                        {views.map((_, i) => (
                            <span
                                key={i}
                                className={`h-1 flex-1 transition-colors ${i === viewIdx ? "bg-black" : "bg-white/65"}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col border-x border-b border-black/10 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            {variant.brand || "ZIKIANO"}
                        </p>
                        <h3 className="truncate text-sm font-black uppercase tracking-tight text-black sm:text-base">
                            {group.modelName}
                        </h3>
                        <p className="mt-1 truncate text-xs font-semibold capitalize text-zinc-500">
                            {variant.colourLabel}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-black">{fmtPrice(variant.salePrice)}</p>
                        {variant.isOnSale && variant.realPrice > variant.salePrice && (
                            <p className="text-[11px] font-semibold text-zinc-400 line-through">
                                {fmtPrice(variant.realPrice)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex min-h-5 flex-wrap gap-2">
                    {group.variants.map((v, i) => (
                        <button
                            key={v.colourKey}
                            type="button"
                            title={v.colourLabel}
                            onClick={(e) => {
                                e.stopPropagation();
                                setColourIdx(i);
                                setViewIdx(0);
                            }}
                            className={`h-5 w-5 border transition-transform ${
                                i === colourIdx ? "scale-110 border-black ring-2 ring-black/10" : "border-black/15 hover:scale-110"
                            }`}
                            style={{ backgroundColor: v.colourHex }}
                            aria-label={`Select ${v.colourLabel}`}
                        />
                    ))}
                </div>

                <div className="relative mt-4">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSizeOpen((o) => !o);
                        }}
                        className={`flex h-11 w-full items-center justify-between border px-3 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${
                            sizeError
                                ? "border-red-500 bg-red-50 text-red-600"
                                : selectedSize
                                  ? "border-black bg-white text-black"
                                  : "border-black/15 bg-white text-zinc-500 hover:border-black"
                        }`}
                    >
                        <span>{sizeError ? "Choose size" : selectedSize ? `UK/SA ${selectedSize}` : "Select size"}</span>
                        <ChevronDown size={15} className={`transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
                    </button>

                    {sizeOpen && (
                        <div className="absolute bottom-full left-0 right-0 z-30 mb-2 border border-black bg-white p-2 shadow-2xl">
                            <div className="grid grid-cols-4 gap-1.5">
                                {SIZES.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSize(s);
                                            setSizeOpen(false);
                                            setSizeError(false);
                                        }}
                                        className={`h-9 text-xs font-black ${
                                            selectedSize === s
                                                ? "bg-black text-white"
                                                : "bg-zinc-100 text-black hover:bg-black hover:text-white"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isSoldOut}
                    className={`mt-3 flex h-12 w-full items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
                        added
                            ? "bg-zikiano-signal text-black"
                            : isSoldOut
                              ? "bg-zinc-200 text-zinc-400"
                              : "bg-black text-white hover:bg-zikiano-signal hover:text-black"
                    }`}
                >
                    {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                    {added ? "Added" : isSoldOut ? "Sold out" : "Add to bag"}
                </button>
            </div>

            {zoomOpen && currentView && (
                <div
                    className="fixed inset-0 z-[80] flex flex-col bg-black text-white"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${group.modelName} zoom viewer`}
                >
                    <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black uppercase tracking-tight">{group.modelName}</p>
                            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                                {variant.colourLabel} / {currentView.view}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setZoomScale((s) => Math.max(1, Number((s - 0.25).toFixed(2))))}
                                className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:bg-white hover:text-black"
                                aria-label="Zoom out"
                            >
                                <Minus size={17} />
                            </button>
                            <span className="hidden min-w-14 text-center text-[10px] font-black uppercase tracking-[0.16em] text-white/55 sm:inline">
                                {Math.round(zoomScale * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setZoomScale((s) => Math.min(2.5, Number((s + 0.25).toFixed(2))))}
                                className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:bg-white hover:text-black"
                                aria-label="Zoom in"
                            >
                                <Plus size={17} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoomOpen(false)}
                                className="ml-1 flex h-10 w-10 items-center justify-center bg-white text-black transition-colors hover:bg-zikiano-signal"
                                aria-label="Close zoom viewer"
                            >
                                <X size={19} />
                            </button>
                        </div>
                    </div>

                    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
                        {views.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setViewIdx((p) => (p - 1 + views.length) % views.length)}
                                    className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/90 text-black transition-colors hover:bg-zikiano-signal sm:left-6"
                                    aria-label="Previous product image"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewIdx((p) => (p + 1) % views.length)}
                                    className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/90 text-black transition-colors hover:bg-zikiano-signal sm:right-6"
                                    aria-label="Next product image"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            </>
                        )}

                        <img
                            src={currentView.imageUrl}
                            alt={`${group.modelName} ${variant.colourLabel} enlarged`}
                            className="max-h-[78vh] max-w-full object-contain transition-transform duration-200"
                            style={{ transform: `scale(${zoomScale})` }}
                        />
                    </div>

                    {views.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-3 sm:justify-center">
                            {views.map((view, i) => (
                                <button
                                    key={`zoom-${view.id}`}
                                    type="button"
                                    onClick={() => {
                                        setViewIdx(i);
                                        setZoomScale(1);
                                    }}
                                    className={`relative h-16 w-16 shrink-0 overflow-hidden border ${
                                        i === viewIdx ? "border-white" : "border-white/20 opacity-60 hover:opacity-100"
                                    }`}
                                    aria-label={`View ${view.view}`}
                                >
                                    <img src={view.imageUrl} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

export default function ShoeCard({ group }: { group: ModelGroup }) {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col overflow-hidden bg-white">
                    <div className="aspect-[4/5] animate-pulse bg-zikiano-stone" />
                    <div className="border-x border-b border-black/10 p-4">
                        <div className="h-3 w-1/3 animate-pulse bg-zinc-100" />
                        <div className="mt-3 h-4 w-2/3 animate-pulse bg-zinc-100" />
                        <div className="mt-5 h-11 animate-pulse bg-zinc-100" />
                    </div>
                </div>
            }
        >
            <CardContent group={group} />
        </Suspense>
    );
}
