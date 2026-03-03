import './globals.css'; // <--- THIS MUST BE HERE
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en">
        <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>

        <footer className="bg-zinc-50 border-t border-zinc-200 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-3xl font-black italic tracking-tighter mb-6">ZIKIANO</h2>
                    <p className="text-zinc-500 text-sm max-w-sm leading-relaxed italic">
                        Zikiano is South Africa's leading distributor of artisanal performance footwear.
                        We specialize in reaching the most remote locations via GPS-coordinate delivery.
                    </p>
                </div>

                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-zinc-900">Operations</h4>
                    <div className="space-y-2 text-sm text-zinc-500">
                        <p>Hout Bay, Cape Town</p>
                        <p className="hover:text-black transition-colors">Contact: +27 21 000 0000</p>
                    </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-between">
                    <div
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 text-left md:text-right leading-loose">
                        Website Designed & Engineered by
                        <br/>
                        <span className="text-black text-xs font-black">Neria Solutions</span>
                    </div>
                </div>
            </div>

            <div
                className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-200 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                <p>© 2026 ZIKIANO ZA</p>
                <div className="flex gap-6">
                    <span>Privacy</span>
                    <span>Terms</span>
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}