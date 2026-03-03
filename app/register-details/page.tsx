"use client";

import { useState } from 'react';
import { supabase } from '@/lib/superbase';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const login = useStore((state) => state.login);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Redirects user back to your site after they click the email link
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
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl">
                <h1 className="text-3xl font-black italic mb-8 text-center uppercase">Join Zikiano</h1>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-4 bg-zinc-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Create Password"
                        className="w-full p-4 bg-zinc-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
                    >
                        {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                    Already have an account? <Link href="/login" className="text-black font-bold underline">Login</Link>
                </p>
            </div>
        </div>
    );
}