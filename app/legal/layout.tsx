export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <a href="/" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black mb-12 block">
                    ← Back to Shop
                </a>
                <div className="prose prose-zinc max-w-none">
                    {children}
                </div>
            </div>
        </div>
    );
}