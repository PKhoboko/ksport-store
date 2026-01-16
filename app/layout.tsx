import React from 'react';
import Header from '@/components/Header';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-white">{children}</main>

        <footer className="bg-zinc-50 border-t border-zinc-200 pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter mb-4">ÉLÉGANCE</h2>
                        <p className="text-zinc-500 max-w-xs text-sm">Artisanal footwear delivered across South Africa.</p>
                    </div>
                    <div className="text-sm">
                        <h4 className="font-bold mb-4 uppercase tracking-widest text-xs">Customer Service</h4>
                        <ul className="text-zinc-500 space-y-2">
                            <li>Shipping Policy</li>
                            <li>Returns</li>
                            <li>Contact</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        © 2026 ÉLÉGANCE ZA
                    </p>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Website Created by <span className="text-black border-b border-black cursor-pointer">[YOUR COMPANY NAME]</span>
                    </div>
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}