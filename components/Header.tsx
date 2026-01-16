"use client";
import Link from 'next/link';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useCart } from '@/lib/store'; // Ensure useAuth is exported/imported correctly
import { useAuth } from '@/lib/auth-mock';
import { useState, useEffect } from 'react';

export default function Header() {
    const { cart } = useCart();
    const { user, logout } = useAuth(); // Connect to our Mock Auth
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <header className="border-b sticky top-0 bg-white/95 backdrop-blur-md z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter italic">ÉLÉGANCE</Link>

                <div className="flex gap-6 items-center">
                    {mounted && user ? (
                        <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                Hi, {user.name}
              </span>
                            <button onClick={logout} className="text-gray-400 hover:text-black"><LogOut size={18}/></button>
                        </div>
                    ) : (
                        <Link href="/login" className="hover:scale-110 transition-transform"><User size={20} /></Link>
                    )}

                    <Link href="/cart" className="relative p-2 group">
                        <ShoppingBag size={22} className="group-hover:rotate-12 transition-transform" />
                        {mounted && cart.length > 0 && (
                            <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                {cart.length}
              </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}