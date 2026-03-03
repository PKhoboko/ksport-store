"use client";
import Link from 'next/link';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function Header() {
    const cart = useStore((state) => state.cart);
    const user = useStore((state) => state.user);
    const logout = useStore((state) => state.logout);

    // This state prevents the "missing items" bug on refresh
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <header className="border-b sticky top-0 bg-white/95 backdrop-blur-md z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="text-2xl font-black tracking-tighter italic">
                    ZIKIANO
                </Link>

                {/* Navigation Icons */}
                <div className="flex gap-6 items-center">
                    {/* 1. Login/User Section */}
                    {mounted && user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">
                                Hi, {user.name}
                            </span>
                            <button onClick={logout} className="text-zinc-400 hover:text-black transition-colors">
                                <LogOut size={18}/>
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="hover:text-zinc-500 transition-colors">
                            <User size={20} />
                        </Link>
                    )}

                    {/* 2. Shopping Bag Section */}
                    <Link href="/cart" className="relative p-2 group">
                        <ShoppingBag size={22} className="group-hover:rotate-12 transition-transform duration-300" />

                        {/* The Notification Badge */}
                        {mounted && cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white animate-in zoom-in duration-300">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}