import './globals.css';
import { supabase } from '@/lib/superbase';
import ShoeCard from '@/components/ShoeCard';

export default async function Home() {
    const { data: shoes, error } = await supabase
        .from('shoes')
        .select('*')
        .order('name', { ascending: true }); // FIX 1: Remove .gt('stock', 0) — shows all shoes

    // FIX 2: Log errors so you can see what's failing
    if (error) {
        console.error('Supabase error:', error.message);
    }


    return (
        <div className="pb-20">
            <section className="bg-zinc-900 text-white py-32 px-6 text-center">
                <h1 className="text-7xl font-black italic tracking-tighter mb-4">ZIKIANO.</h1>
                <p className="text-zinc-500 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">
                    High-performance gear delivered across South Africa.
                    Hand made craftsmanship, nothing but quality leather.
                </p>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {shoes?.map((shoe) => (
                    <ShoeCard key={shoe.id} shoe={shoe} />
                ))}
            </div>
        </div>
    );
}