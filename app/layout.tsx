import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${inter.className} flex min-h-screen flex-col antialiased`}>
        <Header />
        <main className="flex-grow">{children}</main>

        <footer className="border-t border-black/10 bg-black px-0 py-14 text-white sm:py-20">
            <div className="premium-container grid grid-cols-1 gap-12 md:grid-cols-4">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/zikiano-logo-dark-compact.jpg"
                            alt="ZIKIANO OUTBACK - South African handmade goods"
                            width={500}
                            height={420}
                            className="h-36 w-auto max-w-full object-contain sm:h-44"
                        />
                    </div>
                    <p className="mt-6 max-w-lg text-sm font-semibold uppercase leading-6 tracking-[0.12em] text-white/55">
                        A South African company creating handmade products with premium fruit leather supplied from Nigeria,
                        starting with footwear and expanding into bags and clothing.
                        All customer checkout flows are built around Paystack.
                    </p>
                </div>

                <div>
                    <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Operations</h4>
                    <div className="space-y-3 text-sm font-semibold text-white/70">
                        <p>Bellville, Cape Town</p>
                        <p>+27 62 420 3360</p>
                        <p>info@zikiano.com</p>
                    </div>
                </div>

                <div>
                    <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Store</h4>
                    <div className="flex flex-col gap-3 text-sm font-semibold text-white/70">
                        <Link href="/shop" className="transition-colors hover:text-white">Shop</Link>
                        <Link href="/legal/terms" className="transition-colors hover:text-white">Terms & Conditions</Link>
                        <Link href="/legal/returns" className="transition-colors hover:text-white">Return Policy</Link>
                    </div>
                </div>
            </div>

            <div className="premium-container mt-14 flex flex-col gap-5 border-t border-white/10 pt-7 text-[10px] font-black uppercase tracking-[0.22em] text-white/35 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                    <p>© 2026 ZIKIANO OUTBACK ZA</p>
                    <p>POPIA compliant</p>
                    <p>Secure payment by Paystack</p>
                </div>
                <div>
                    <span>Designed & Engineered by </span>
                    <a
                        href="https://www.neriasolutions.co.za"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white transition-colors hover:text-zikiano-signal"
                    >
                        Neria Solutions
                    </a>
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}
