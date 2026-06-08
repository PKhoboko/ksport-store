"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

const navItems = [
    { href: "/", label: "New In" },
    { href: "/shop", label: "Shop" },
    { href: "/shop", label: "Footwear" },
    { href: "/shop", label: "Bags" },
    { href: "/shop", label: "Clothing" },
];

export default function Header() {
    const cart = useStore((state) => state.cart);
    const user = useStore((state) => state.user);
    const logout = useStore((state) => state.logout);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleCartClick = (e: React.MouseEvent) => {
        if (!mounted) return;
        if (!user) {
            e.preventDefault();
            router.push("/login?redirect=/cart");
        }
    };

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? "border-black/10 bg-white/90 shadow-[0_16px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl"
                    : "border-black/10 bg-white"
            }`}
        >
            <div className="bg-zikiano-signal text-black">
                <div className="premium-container flex min-h-9 items-center justify-center py-2 text-center text-[11px] font-black uppercase tracking-[0.18em]">
                    Testing mode - this website is not live for real orders yet
                </div>
            </div>

            <div className="bg-black text-white">
                <div className="premium-container flex h-9 items-center justify-center text-[10px] font-bold uppercase tracking-[0.22em] sm:justify-between">
                    <span>Paystack secure checkout</span>
                    <span className="hidden sm:inline">South African handmade goods crafted with premium supplied fruit leather.</span>
                </div>
            </div>

            <div className="premium-container flex h-20 items-center justify-between gap-4">
                <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center border border-black/10 md:hidden"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>

                <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Zikiano home">
                    {logoError ? (
                        <span className="text-2xl font-black uppercase leading-none tracking-tight">ZIKIANO OUTBACK</span>
                    ) : (
                        <Image
                            src="/logo-premium.svg"
                            alt="ZIKIANO OUTBACK - South African handmade goods"
                            width={420}
                            height={108}
                            className="h-11 w-auto object-contain sm:h-12 lg:h-14"
                            priority
                            onError={() => setLogoError(true)}
                        />
                    )}
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={`${item.href}-${item.label}`}
                            href={item.href}
                            className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:text-black"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        href="/shop"
                        className="hidden h-11 w-11 items-center justify-center border border-black/10 transition-colors hover:border-black hover:bg-black hover:text-white sm:inline-flex"
                        aria-label="Search products"
                    >
                        <Search size={18} />
                    </Link>

                    {mounted && user ? (
                        <div className="hidden items-center gap-2 sm:flex">
                            <span className="max-w-28 truncate text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                                {user.name}
                            </span>
                            <button
                                type="button"
                                onClick={logout}
                                className="inline-flex h-11 w-11 items-center justify-center border border-black/10 transition-colors hover:border-black hover:bg-black hover:text-white"
                                title="Sign out"
                            >
                                <LogOut size={17} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="hidden h-11 w-11 items-center justify-center border border-black/10 transition-colors hover:border-black hover:bg-black hover:text-white sm:inline-flex"
                            title="Login"
                            aria-label="Login"
                        >
                            <User size={18} />
                        </Link>
                    )}

                    <Link
                        href="/cart"
                        onClick={handleCartClick}
                        className="relative inline-flex h-11 w-11 items-center justify-center bg-black text-white transition-colors hover:bg-zinc-800"
                        title={mounted && !user ? "Login to view cart" : "Cart"}
                        aria-label="Cart"
                    >
                        <ShoppingBag size={19} />
                        {mounted && cart.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zikiano-signal px-1 text-[10px] font-black text-black ring-2 ring-white">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {menuOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)}>
                    <div
                        className="ml-auto flex h-full w-[86vw] max-w-sm flex-col bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-black/10 pb-5">
                            <span className="flex items-center gap-3">
                                <Image
                                    src="/logo-premium.svg"
                                    alt="ZIKIANO OUTBACK - South African handmade goods"
                                    width={420}
                                    height={108}
                                    className="h-11 w-auto object-contain"
                                />
                            </span>
                            <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center border border-black/10"
                                onClick={() => setMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex flex-col py-8">
                            {navItems.map((item) => (
                                <Link
                                    key={`mobile-${item.href}-${item.label}`}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="border-b border-black/10 py-5 text-2xl font-black uppercase tracking-tight"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="flex h-12 items-center justify-center border border-black text-xs font-black uppercase tracking-[0.18em]"
                            >
                                Account
                            </Link>
                            <Link
                                href="/cart"
                                onClick={(e) => {
                                    setMenuOpen(false);
                                    handleCartClick(e);
                                }}
                                className="flex h-12 items-center justify-center bg-black text-xs font-black uppercase tracking-[0.18em] text-white"
                            >
                                Bag {mounted && cart.length > 0 ? `(${cart.length})` : ""}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
