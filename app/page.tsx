/**
 * app/page.tsx
 */
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
    const { groups, heroImages } = groupShoes(allShoes);

    const modelImages = groups
        .flatMap((g) => g.variants.flatMap((v) => v.views.map((view) => view.imageUrl)))
        .filter(Boolean);

    // Deduplicate, shuffle, then take only 3 for the hero slideshow
    const seen = new Set<string>();
    const pool: string[] = [];
    for (const url of [...heroImages, ...modelImages]) {
        if (url && !seen.has(url)) { seen.add(url); pool.push(url); }
    }
    // Fisher-Yates shuffle on the server so every page load picks 3 different images
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const allHeroImages = pool.slice(0, 3);

    const totalColourways = groups.reduce((acc, g) => acc + g.variants.length, 0);

    return (
        <div className="min-h-screen bg-zinc-50">
            <HeroSlider images={allHeroImages} />

            {/* Section header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-14 pb-1">
                <p className="text-[8px] sm:text-[9px] font-black tracking-[0.35em] text-zinc-400 uppercase mb-1">
                    The Collection
                </p>
                <h2 className="text-xl sm:text-4xl font-black italic tracking-tighter text-zinc-900 leading-none">
                    All Shoes
                </h2>
                <p className="text-[9px] sm:text-xs text-zinc-400 font-medium mt-1">
                    {groups.length} models &nbsp;·&nbsp; {totalColourways} colourways
                </p>
            </div>

            {/*
        Mobile:  2 columns — professional boutique grid, cards are compact
                 gap-2 keeps them tight like a lookbook
        Tablet:  2 columns with more breathing room
        Desktop: 3 columns
      */}
            <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-10
                      grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3
                      gap-2 sm:gap-6 lg:gap-8">
                {groups.map((group) => (
                    <ShoeCard key={group.modelKey} group={group} />
                ))}
            </div>
        </div>
    );
}