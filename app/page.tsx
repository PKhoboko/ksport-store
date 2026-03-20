import './globals.css';
import { supabase } from '@/lib/superbase';
import ShoeCard from '@/components/ShoeCard';
import { groupShoesByModel } from '@/lib/Groupshoesbymodel';

export const revalidate = 0;

export default async function Home() {
    const { data: shoes, error } = await supabase
        .from('shoes')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Supabase error:', error.message);
    }

    const groups = groupShoesByModel(shoes ?? []);

    // Use the first shoe's image as the hero background
    const heroBg = shoes?.[1]?.image_url ?? null;

    return (
        <div className="pb-20">
            <section
                className="relative text-white py-32 px-6 text-center overflow-hidden"
                style={{
                    backgroundColor: '#18181b',
                    backgroundImage: heroBg ? `url(${heroBg})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark overlay so text stays readable */}
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10">
                    <h1 className="text-7xl font-black italic tracking-tighter mb-4">ZIKIANO.</h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">
                        High-performance gear delivered across South Africa.
                        Hand made craftsmanship, nothing but quality leather.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {Object.values(groups).map((variants) => (
                    <ShoeCard key={variants[0].id} shoes={variants} />
                ))}
            </div>
        </div>
    );
}