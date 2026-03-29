"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function Header() {
    const cart   = useStore((state) => state.cart);
    const user   = useStore((state) => state.user);
    const logout = useStore((state) => state.logout);
    const router = useRouter();

    const [mounted, setMounted]     = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [scrolled, setScrolled]   = useState(false);

    useEffect(() => {
        setMounted(true);
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /** Guard: send guests to login, return them to /cart after sign-in */
    const handleCartClick = (e: React.MouseEvent) => {
        if (!mounted) return;
        if (!user) {
            e.preventDefault();
            router.push('/login?redirect=/cart');
        }
        // If logged in, the <Link href="/cart"> navigates normally
    };

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-500 ${
                scrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-100'
                    : 'bg-white border-b border-zinc-100'
            }`}
        >
            {/* Gold accent bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">

                {/* Brand Logo */}
                <Link href="/" className="flex items-center group">
                    {logoError ? (
                        <span className="text-3xl font-black tracking-tighter italic text-zinc-900 group-hover:text-amber-600 transition-colors duration-300">
                            ZIKIANO
                        </span>
                    ) : (
                        <Image
                            src="/logo.jpg"
                            alt="ZIKIANO"
                            width={180}
                            height={52}
                            className="h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
                            priority
                            onError={() => setLogoError(true)}
                        />
                    )}
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-10">
                    {[
                        { href: '/',     label: 'Home' },
                        { href: '/shop', label: 'Shop' },
                    ].map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-amber-500 after:transition-all after:duration-300 hover:after:w-full pb-1"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Right Icons */}
                <div className="flex gap-5 items-center">

                    {/* User section */}
                    {mounted && user ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:flex text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-full">
                                Hi, {user.name}
                            </span>
                            <button
                                onClick={logout}
                                title="Sign out"
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:text-black hover:border-zinc-900 transition-all duration-200"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-black hover:border-zinc-900 transition-all duration-200"
                            title="Login"
                        >
                            <User size={18} />
                        </Link>
                    )}

                    {/* Shopping Bag — guests are redirected to /login?redirect=/cart */}
                    <Link
                        href="/cart"
                        onClick={handleCartClick}
                        className="relative w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-amber-500 transition-all duration-300 group shadow-md shadow-zinc-200"
                        title={mounted && !user ? 'Login to view cart' : 'Cart'}
                    >
                        <ShoppingBag
                            size={20}
                            className="group-hover:scale-110 transition-transform duration-200"
                        />
                        {mounted && cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                </div>
            </div>
        </header>
    );
}