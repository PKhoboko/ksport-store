"use client";
import { Suspense, useState } from 'react';
import { supabase } from '@/lib/superbase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

function LoginFormContent() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const router         = useRouter();
    const login          = useStore((state) => state.login);
    const searchParams   = useSearchParams();
    const nextPath       = searchParams.get('redirect') || '/';
    const isCartRedirect = nextPath === '/cart';

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            login(data.user.email!);
            router.push(nextPath);  // ← returns user to /cart (or wherever they came from)
            router.refresh();
        }
    };

    return (
        <>
            {/* Cart redirect hint — only shown when coming from the cart icon */}
            {isCartRedirect && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                    <ShoppingBag size={15} className="text-amber-500 shrink-0" />
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                        Sign in to continue to your cart
                    </p>
                </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-2 text-zinc-400">
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-[10px] font-bold uppercase text-zinc-400 hover:text-black transition-colors underline decoration-zinc-200 underline-offset-4"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Inline error instead of alert() */}
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs text-red-500 font-bold">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 mt-4 active:scale-[0.98]"
                >
                    {loading ? 'Verifying…' : 'Sign In'}
                </button>
            </form>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-zinc-100">
                <h1 className="text-3xl font-black italic mb-8 text-center uppercase tracking-tighter">
                    ZIKIANO LOGIN
                </h1>

                <Suspense fallback={
                    <div className="text-center py-10 uppercase font-bold tracking-widest text-zinc-400">
                        Loading…
                    </div>
                }>
                    <LoginFormContent />
                </Suspense>

                <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
                    <p className="text-sm text-zinc-500">
                        New to Zikiano?{' '}
                        <Link href="/register-details" className="text-black font-black underline hover:text-zinc-600 transition-colors">
                            Join the Club
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}