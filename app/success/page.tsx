"use client";
import { useEffect } from 'react';
import { useCart } from '@/lib/store';
import Link from 'next/link';

export default function Success() {
    const clear = useCart(s => s.clearCart);
    useEffect(() => clear(), [clear]);

    return (
        <div className="text-center py-40">
            <h1 className="text-6xl font-black mb-4 italic">SUCCESS.</h1>
            <p className="text-zinc-500 mb-10">Your order is being prepared for shipment.</p>
            <Link href="/" className="bg-black text-white px-10 py-4 rounded-full font-bold">CONTINUE SHOPPING</Link>
        </div>
    );
}