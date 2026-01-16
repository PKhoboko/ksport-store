"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/auth-mock';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleManualLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // For now: Any password works to let you in
        if (email && password) {
            login(email);
            router.push('/');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-6 py-12">
            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black italic tracking-tighter mb-2">ÉLÉGANCE</h1>
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Member Access</p>
                </div>

                {/* 1. Google Auth (UI Only) */}
                <button
                    onClick={() => alert("Google Auth requires Supabase. Using Manual Login for now.")}
                    className="w-full flex items-center justify-center gap-3 border border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all mb-6"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                    Continue with Google
                </button>

                <div className="relative mb-8 text-center">
                    <hr className="border-gray-100" />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold text-gray-300 uppercase">Or Manual</span>
                </div>

                {/* 2. Manual Login Form */}
                <form onSubmit={handleManualLogin} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase ml-1 text-gray-400">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-4 mt-1 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="you@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase ml-1 text-gray-400">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-4 mt-1 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-gray-400">
                    Don't have an account? <span className="text-black font-bold cursor-pointer hover:underline">Register Now</span>
                </p>
            </div>
        </div>
    );
}