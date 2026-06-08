"use client";

import { useState } from "react";
import { supabase } from "@/lib/superbase";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://zikiano.com/update-password",
        });

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        setSent(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl">
                <h2 className="text-2xl font-black italic mb-8 text-center uppercase">
                    Forgot Password
                </h2>

                {sent ? (
                    <p className="text-center text-green-600 font-semibold">
                        Check your email for a reset link.
                    </p>
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
                            className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50"
                        >
                            {loading ? "SENDING..." : "SEND RESET LINK"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}