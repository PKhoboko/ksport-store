"use client";

import { useState } from 'react';
import { supabase } from '@/lib/superbase';
import { useRouter } from 'next/navigation';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest"
                    >
                        {loading ? "UPDATING..." : "UPDATE PASSWORD"}
                    </button>
                </form>
            </div>
        </div>
    );
}