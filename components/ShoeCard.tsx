"use client";
import { Shoe } from '@/lib/store';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';

type AvailabilityStatus = 'instore' | 'on_request' | 'sold_out' | 'available';

interface ShoeVariant extends Shoe {
    status?: AvailabilityStatus;
}

interface ShoeCardGroupProps {
    shoes: ShoeVariant[];
}

function deriveStatus(shoe: ShoeVariant): AvailabilityStatus {
    if (shoe.status) return shoe.status;
    if (shoe.stock === 0) return 'sold_out';
    return 'available';
}

function colourLabel(name: string): string {
    const parts = name.split('_');
    return parts.length > 1 ? parts.slice(1).join(' ') : 'Default';
}

const STATUS_CONFIG: Record<
    AvailabilityStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    available:  { label: 'In Stock',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    instore:    { label: 'In Store',   bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500'     },
    on_request: { label: 'On Request', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
    sold_out:   { label: 'Sold Out',   bg: 'bg-zinc-100',   text: 'text-zinc-500',    dot: 'bg-zinc-400'    },
};

function ColourSwatch({
                          shoe,
                          selected,
                          onClick,
                      }: {
    shoe: ShoeVariant;
    selected: boolean;
    onClick: () => void;
}) {
    const status = deriveStatus(shoe);
    const isSoldOut = status === 'sold_out';

    return (
        <button
            onClick={onClick}
            title={colourLabel(shoe.name)}
            className={`
        relative w-8 h-8 rounded-full border-2 overflow-hidden transition-all duration-200
        ${selected
                ? 'border-zinc-900 scale-110 shadow-md'
                : 'border-transparent hover:border-zinc-400 hover:scale-105'
            }
        ${isSoldOut ? 'opacity-40' : ''}
      `}
        >
            <img
                src={shoe.image_url}
                alt={colourLabel(shoe.name)}
                className="w-full h-full object-cover"
            />
            {isSoldOut && (
                <span className="absolute inset-0 flex items-center justify-center">
          <span className="block w-[2px] h-full bg-zinc-500/60 rotate-45 absolute" />
        </span>
            )}
        </button>
    );
}

/** Placeholder swatch shown when a model only has one variant — hints more colours are coming */
function ComingSoonSwatch() {
    return (
        <div
            title="More colours coming soon"
            className="relative w-8 h-8 rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center cursor-default"
        >
            <span className="text-zinc-400 text-[14px] font-bold leading-none select-none">+</span>
        </div>
    );
}

function StatusBadge({ status }: { status: AvailabilityStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
    </span>
    );
}

export default function ShoeCard({ shoes }: ShoeCardGroupProps) {
    const addToCart = useStore((state) => state.addToCart);
    const [mounted, setMounted] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => { setMounted(true); }, []);

    if (!shoes || shoes.length === 0) return null;

    const shoe = shoes[selectedIndex];
    const status = deriveStatus(shoe);
    const canAddToCart = status === 'available' || status === 'instore';
    const isOnRequest = status === 'on_request';

    const baseName = shoe.name.split('_')[0];
    const colour = colourLabel(shoe.name);
    const showLowStock = status === 'available' && shoe.stock > 0 && shoe.stock < 3;

    // Show the "coming soon" placeholder when there's only one variant
    const isSingleVariant = shoes.length === 1;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(price);

    return (
        <div className="group bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl border border-zinc-100 flex flex-col h-full">

            {/* Image */}
            <div className="aspect-[4/5] overflow-hidden bg-zinc-100 relative">
                <img
                    src={shoe.image_url}
                    alt={`${baseName} – ${colour}`}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                />
                {showLowStock && (
                    <span className="absolute top-4 left-4 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow">
            Low Stock
          </span>
                )}
                <span className="absolute top-4 right-4">
          <StatusBadge status={status} />
        </span>
            </div>

            {/* Details */}
            <div className="p-7 flex flex-col flex-grow">

                {/* Brand + Name */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
                        {shoe.brand}
                    </p>
                    <h3 className="text-xl font-black leading-tight text-zinc-900 tracking-tighter">
                        {baseName}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 capitalize">{colour}</p>
                </div>

                {/* Colour swatches row */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mr-1">
            Colours
          </span>

                    {/* Real variants */}
                    {shoes.map((s, i) => (
                        <ColourSwatch
                            key={s.id}
                            shoe={s}
                            selected={i === selectedIndex}
                            onClick={() => setSelectedIndex(i)}
                        />
                    ))}

                    {/* Placeholder when only one colour exists */}
                    {isSingleVariant && (
                        <div className="group/tip relative">
                            <ComingSoonSwatch />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-[9px] rounded-lg whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none">
                                More colours coming soon
                            </div>
                        </div>
                    )}
                </div>

                {/* Price + CTA */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
            <span className="font-black text-2xl text-zinc-900">
              {mounted ? formatPrice(shoe.price) : `R${shoe.price}`}
            </span>
                    </div>

                    {canAddToCart && (
                        <button
                            onClick={() => addToCart(shoe)}
                            className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 bg-black text-white hover:bg-zinc-800 active:scale-95 shadow-lg shadow-zinc-200"
                        >
                            Add to Bag
                        </button>
                    )}

                    {isOnRequest && (
                        <button
                            onClick={() => alert(`Enquire about ${baseName} – ${colour}`)}
                            className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-lg shadow-amber-100"
                        >
                            Request This Shoe
                        </button>
                    )}

                    {status === 'sold_out' && (
                        <div className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-center bg-zinc-100 text-zinc-400 cursor-not-allowed select-none">
                            Sold Out
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}