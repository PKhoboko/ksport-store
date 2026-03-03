"use client";

import { useState } from 'react';
import { supabase } from '@/lib/superbase';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            alert(error.message);
        } else {
            setMessage("Check your email for the reset link.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl">
                <h2 className="text-2xl font-black italic mb-4 text-center">RESET PASSWORD</h2>
                <p className="text-zinc-500 text-center mb-8 text-sm">We'll send a recovery link to your inbox.</p>

                {message ? (
                    <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center font-bold">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full p-4 bg-zinc-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest"
                        >
                            {loading ? "SENDING..." : "SEND RESET LINK"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}