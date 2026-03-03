"use client";
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { CheckCircle, Home } from 'lucide-react';

export default function SuccessPage() {
    const clearCart = useStore((state) => state.clearCart);
    const setToast = useStore((state) => state.setToast);

    useEffect(() => {
        // Clear bag and remove any lingering notifications immediately
        clearCart();
        setToast(null);
    }, [clearCart, setToast]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
                <CheckCircle size={48} />
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Payment Received</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-12">
                ZIKIANO Order Confirmed • Check your email for GPS tracking
            </p>

            <Link href="/" className="group flex items-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all">
                <Home size={16} />
                Back to Collection
            </Link>
        </div>
    );
}