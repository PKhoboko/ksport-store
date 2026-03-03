"use client";
import { useState } from 'react';
import { supabase } from '@/lib/superbase';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link'; // Added for navigation to Register and Forgot Password

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const login = useStore((state) => state.login);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        // 2. Update global state
        if (data.user) {
            login(data.user.email!);

            // 3. Redirect to home
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-zinc-100">
                <h1 className="text-3xl font-black italic mb-8 text-center uppercase tracking-tighter">ZIKIANO LOGIN</h1>

                <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest ml-2 text-zinc-400">Email Address</label>
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password</label>
                            {/* FORGOT PASSWORD LINK */}
                            <Link href="/forgot-password" className="text-[10px] font-bold uppercase text-zinc-400 hover:text-black transition-colors underline decoration-zinc-200 underline-offset-4">
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? "VERIFYING..." : "SIGN IN"}
                    </button>
                </form>

                {/* REGISTER LINK SECTION */}
                <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
                    <p className="text-sm text-zinc-500">
                        New to Zikiano?{" "}
                        <Link href="/register" className="text-black font-black underline hover:text-zinc-600 transition-colors">
                            JOIN THE CLUB
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}