import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow">{children}</main>

        <footer className="bg-zinc-50 border-t border-zinc-200 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
                {/* Brand Section */}
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-3xl font-black italic tracking-tighter mb-6 text-black uppercase">ZIKIANO</h2>
                    <p className="text-zinc-500 text-sm max-w-sm leading-relaxed italic">
                        Zikiano is South Africa's leading distributor of artisanal performance footwear.
                        We specialize in reaching the most remote locations via GPS-coordinate delivery.
                    </p>
                </div>

                {/* Operations Section */}
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-zinc-900">Operations</h4>
                    <div className="space-y-2 text-sm text-zinc-500">
                        <p>Bellville, Cape Town</p>
                        <p className="hover:text-black transition-colors">Contact: +27 62 420 3360</p>
                        <p className="hover:text-black transition-colors">Email: info@zikiano.com</p>
                    </div>
                </div>

                {/* Engineering Credit */}
                <div className="flex flex-col items-start md:items-end justify-start">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 text-left md:text-right leading-loose">
                        Website Designed & Engineered by
                        <br/>
                        <a href="https://www.neriasolutions.co.za"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-black text-xs font-black hover:underline transition-all">
                            Neria Solutions
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Legal Bar */}
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <p>© 2026 ZIKIANO ZA</p>
                    <p className="opacity-50 italic">POPIA COMPLIANT</p>
                </div>

                <div className="flex gap-8">
                    <Link href="/legal/terms" className="hover:text-black transition-colors underline decoration-zinc-200 underline-offset-4">
                        Terms & Conditions
                    </Link>
                    <Link href="/legal/returns" className="hover:text-black transition-colors underline decoration-zinc-200 underline-offset-4">
                        Return Policy
                    </Link>
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}