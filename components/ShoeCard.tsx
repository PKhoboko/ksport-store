"use client";
import { Shoe } from '@/lib/store';
import { useStore } from '@/lib/store'; // Updated to use the unified store
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ShoeCard({ shoe }: { shoe: Shoe }) {
    const addToCart = useStore((state) => state.addToCart);
    const [mounted, setMounted] = useState(false);

    // Prevents Hydration Mismatch by waiting for the client
    useEffect(() => {
        setMounted(true);
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(price);
    };

    return (
        <div className="group bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl border border-zinc-100 flex flex-col h-full">
            {/* Image Container */}
            <div className="aspect-[4/5] overflow-hidden bg-zinc-100 relative">
                <img
                    src={shoe.image_url}
                    alt={shoe.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                />
                {shoe.stock < 3 && shoe.stock > 0 && (
                    <span className="absolute top-4 left-4 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Low Stock
                    </span>
                )}
            </div>

            {/* Details Container */}
            <div className="p-7 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
                            {shoe.brand}
                        </p>
                        <h3 className="text-xl font-black leading-tight text-zinc-900 tracking-tighter">
                            {shoe.name}
                        </h3>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-black text-2xl text-zinc-900">
                            {mounted ? formatPrice(shoe.price) : `R${shoe.price}`}
                        </span>
                    </div>

                    <button
                        onClick={() => addToCart(shoe)}
                        disabled={shoe.stock === 0}
                        className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                            shoe.stock === 0
                                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                : "bg-black text-white hover:bg-zinc-800 active:scale-95 shadow-lg shadow-zinc-200"
                        }`}
                    >
                        {shoe.stock === 0 ? "Sold Out" : "Add to Bag"}
                    </button>
                </div>
            </div>
        </div>
    );
}