"use client";
import { Shoe, useCart } from '@/lib/store';

export default function ShoeCard({ shoe }: { shoe: Shoe }) {
    const addToCart = useCart((state) => state.addToCart);

    return (
        <div className="group bg-white rounded-3xl overflow-hidden transition-all hover:shadow-hover border border-zinc-100">
            <div className="aspect-[4/5] overflow-hidden bg-zinc-50">
                <img src={shoe.image_url} alt={shoe.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{shoe.brand}</p>
                        <h3 className="text-lg font-bold leading-tight">{shoe.name}</h3>
                    </div>
                    <span className="font-black text-lg">R{shoe.price}</span>
                </div>
                <button
                    onClick={() => addToCart(shoe)}
                    className="w-full mt-4 bg-black text-white py-3 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors uppercase tracking-widest"
                >
                    Add to Bag
                </button>
            </div>
        </div>
    );
}