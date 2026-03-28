import { supabase } from '@/lib/superbase';
import ShoeCard from '@/components/ShoeCard';
import HeroSlider from '@/components/HeroSlider';
import { groupShoes } from '@/lib/Groupshoes';

export const revalidate = 0;

export default async function Home() {
    const { data: shoes, error } = await supabase
        .from('shoes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error('Supabase error:', error.message);

    const allShoes = shoes ?? [];
    const { groups } = groupShoes(allShoes);

    // Pick 3 random models for the hero
    const heroImages = [...groups]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(g => g.variants?.[0]?.views?.[0]?.imageUrl)
        .filter((url): url is string => Boolean(url));

    return (
        <div className="bg-zinc-50 pb-20">
            {heroImages.map((url) => (
                <link key={url} rel="preload" href={url} as="image" />
            ))}

            <HeroSlider images={heroImages} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-1">
                <p className="text-[9px] font-black tracking-[0.35em] text-zinc-400 uppercase mb-1">
                    The Collection
                </p>
                <h2 className="text-4xl font-black italic tracking-tighter text-zinc-900 leading-none">
                    All Shoes
                </h2>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {groups.map((group) => (
                    <ShoeCard key={group.modelKey} group={group} />
                ))}
            </div>
        </div>
    );
}