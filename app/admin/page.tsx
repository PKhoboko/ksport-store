"use client";

import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, SkipForward, ShieldAlert } from 'lucide-react';

type SyncResult = {
    inserted: string[];
    skipped: string[];
    failed: { name: string; reason: string }[];
};

export default function AdminPage() {
    const [secret, setSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SyncResult | null>(null);
    const [error, setError] = useState('');

    const handleSync = async () => {
        if (!secret) return;
        setLoading(true);
        setResult(null);
        setError('');

        try {
            const res = await fetch('/api/sync-shoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Sync failed');
            } else {
                setResult(data);
            }
        } catch (e) {
            setError('Network error — check your connection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
            <div className="max-w-2xl mx-auto">

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert size={18} className="text-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Admin Panel</p>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter">ZIKIANO.</h1>
                    <p className="text-zinc-500 text-sm mt-2 tracking-wide">Sync shoes from GitHub → Supabase</p>
                </div>

                <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
                    <h2 className="text-lg font-black uppercase tracking-widest mb-6">Shoe Sync</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                                Admin Secret
                            </label>
                            <input
                                type="password"
                                placeholder="Enter admin secret"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSync()}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
                            />
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={loading || !secret}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all duration-300 ${
                                loading || !secret
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-900/30'
                            }`}
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Syncing...' : 'Sync Shoes from GitHub'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-950 border border-red-800 rounded-xl text-red-400 text-sm font-bold">
                            ❌ {error}
                        </div>
                    )}
                </div>

                {result && (
                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Inserted', count: result.inserted.length, color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-900' },
                                { label: 'Skipped', count: result.skipped.length, color: 'text-zinc-400', bg: 'bg-zinc-900 border-zinc-800' },
                                { label: 'Failed', count: result.failed.length, color: 'text-red-400', bg: 'bg-red-950 border-red-900' },
                            ].map(({ label, count, color, bg }) => (
                                <div key={label} className={`${bg} border rounded-2xl p-4 text-center`}>
                                    <p className={`text-3xl font-black ${color}`}>{count}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{label}</p>
                                </div>
                            ))}
                        </div>

                        {result.inserted.length > 0 && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle size={14} className="text-emerald-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Inserted</h3>
                                </div>
                                <ul className="space-y-2">
                                    {result.inserted.map((name) => (
                                        <li key={name} className="text-sm text-zinc-300 font-mono">{name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.failed.length > 0 && (
                            <div className="bg-zinc-900 border border-red-900 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <XCircle size={14} className="text-red-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400">Failed</h3>
                                </div>
                                <ul className="space-y-2">
                                    {result.failed.map((f) => (
                                        <li key={f.name} className="text-sm text-red-300 font-mono">
                                            {f.name} <span className="text-zinc-500">— {f.reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.skipped.length > 0 && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <SkipForward size={14} className="text-zinc-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Already in DB</h3>
                                </div>
                                <ul className="space-y-1 max-h-48 overflow-y-auto">
                                    {result.skipped.map((name) => (
                                        <li key={name} className="text-xs text-zinc-600 font-mono">{name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
