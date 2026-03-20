"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/superbase';
import { useRouter } from 'next/navigation';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check that we have a valid session (set by the auth callback)
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setReady(true);
            } else {
                // No session — the link may have expired
                alert('Your reset link has expired. Please request a new one.');
                router.push('/forgot-password');
            }
        });
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            alert("Password updated successfully!");
            router.push('/login');
        }
    };

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Verifying link...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl">
                <h2 className="text-2xl font-black italic mb-8 text-center uppercase">New Password</h2>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <input
                        type="password"
                        placeholder="New Password"
                        className="w-full p-4 bg-zinc-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50"
                    >
                        {loading ? "UPDATING..." : "UPDATE PASSWORD"}
                    </button>
                </form>
            </div>
        </div>
    );
}