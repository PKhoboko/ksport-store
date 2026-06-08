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
            <h1 className="mb-4 text-5xl font-black uppercase tracking-tight">Payment Received</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-12">
                ZIKIANO order received through Paystack
            </p>

            <Link href="/" className="group flex items-center gap-3 bg-black px-10 py-5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-zinc-800">
                <Home size={16} />
                Back to Collection
            </Link>
        </div>
    );
}
