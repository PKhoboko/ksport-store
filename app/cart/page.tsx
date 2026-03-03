"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// The dynamic import with ssr:false is the ONLY way to fix the build error
const CartClient = dynamic(() => import("@/src/components/CartClient"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-black" />
            <p className="mt-4 text-xs font-black uppercase tracking-widest">Initializing Secure Bag...</p>
        </div>
    )
});

export default function CartPage() {
    return <CartClient />;
}