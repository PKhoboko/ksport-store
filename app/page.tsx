import ShoeCard from '@/components/ShoeCard';
import { MOCK_INVENTORY } from '@/lib/store';

export default function Home() {
    return (
        <div className="pb-20">
            <section className="bg-zinc-950 text-white py-32 px-6 text-center">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 italic uppercase">The 2026 Collection</h1>
                <p className="text-zinc-400 max-w-xl mx-auto uppercase tracking-[0.3em] text-xs">Available for immediate dispatch within SA</p>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {MOCK_INVENTORY.map((shoe) => (
                    <ShoeCard key={shoe.id} shoe={shoe} />
                ))}
            </div>
        </div>
    );
}