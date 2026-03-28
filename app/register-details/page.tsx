"use client";

import { useState } from 'react';
import { supabase } from '@/lib/superbase';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false); // New state for legal agreement
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const login = useStore((state) => state.login);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final guard clause
        if (!agreed) {
            alert("Please agree to the Terms and Conditions to continue.");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            login(data.user.email!);
            alert("Registration successful! Check your email for verification.");
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6 py-12">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-zinc-100">
                <div className="text-center mb-10">
                    <p className="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase mb-2">
                        Crafted in Cape Town
                    </p>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">Join Zikiano</h1>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-4 bg-zinc-50 rounded-2xl outline-none border border-transparent focus:border-zinc-200 focus:bg-white transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Create Password"
                        className="w-full p-4 bg-zinc-50 rounded-2xl outline-none border border-transparent focus:border-zinc-200 focus:bg-white transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* --- LEGAL CHECKBOX START --- */}
                    <div className="flex items-start gap-3 px-1 py-2">
                        <input
                            type="checkbox"
                            id="terms-checkbox"
                            className="mt-1 h-4 w-4 rounded border-zinc-300 accent-black cursor-pointer"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            required
                        />
                        <label htmlFor="terms-checkbox" className="text-[11px] leading-relaxed text-zinc-500 cursor-pointer">
                            I agree to the{" "}
                            <Link href="/terms" target="_blank" className="text-black font-bold underline">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="/returns" target="_blank" className="text-black font-bold underline">Return Policy</Link>.
                            <span className="block mt-1 opacity-70 italic text-[9px]">
                                Your data is protected under POPIA.
                            </span>
                        </label>
                    </div>
                    {/* --- LEGAL CHECKBOX END --- */}

                    <button
                        type="submit"
                        disabled={loading || !agreed}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                            loading || !agreed
                                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                : "bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/10"
                        }`}
                    >
                        {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                    </button>
                </form>

                <p className="mt-8 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    Already a member? <Link href="/login" className="text-black underline">Login</Link>
                </p>
            </div>
        </div>
    );
}