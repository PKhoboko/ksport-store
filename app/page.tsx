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
        <div className="min-h-screen bg-white">
            <HeroSlider images={allHeroImages} />

            <section className="border-b border-black/10 bg-white">
                <div className="premium-container grid gap-0 md:grid-cols-3">
                    {[
                        ["Footwear", "Handmade in South Africa with high-quality leather and locally sourced materials."],
                        ["Bags", "Future handmade drops for travel, training, and street carry."],
                        ["Clothing", "The next layer of the South African Zikiano label."],
                    ].map(([title, body]) => (
                        <div key={title} className="border-black/10 py-7 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">
                                Category
                            </p>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-black">{title}</h2>
                            <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-zinc-500">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="premium-container flex flex-col gap-5 px-0 pb-4 pt-14 sm:flex-row sm:items-end sm:justify-between sm:pt-20">
                <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-zinc-400">
                        Latest collection
                    </p>
                    <h2 className="text-4xl font-black uppercase leading-none tracking-tight text-zinc-950 sm:text-6xl">
                        Shop Footwear
                    </h2>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                    {groups.length} models / {totalColourways} colourways
                </p>
            </div>

            <div className="premium-container grid grid-cols-2 gap-2 pb-16 sm:gap-5 sm:pb-24 lg:grid-cols-3 xl:gap-6">
                {groups.map((group) => (
                    <ShoeCard key={group.modelKey} group={group} />
                ))}
            </div>

            <section className="border-t border-black/10 bg-zikiano-stone">
                <div className="premium-container grid gap-8 py-14 sm:py-20 md:grid-cols-2 md:gap-16">
                    <div>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-zinc-500">
                            Our story
                        </p>
                        <h2 className="max-w-xl text-4xl font-black uppercase leading-tight tracking-tight text-black sm:text-5xl">
                            Where street-style meets high fashion.
                        </h2>
                    </div>
                    <div className="space-y-5 text-base leading-7 text-zinc-600">
                        <p>
                            We take pride in using high-quality leather, primarily imported, alongside locally sourced
                            materials. Our mission is to blend high fashion with everyday wear, creating a distinctive
                            style that feels accessible to everyone.
                        </p>
                        <p>
                            Designed to be revitalized after years of wear, our products can be given a renewed life
                            and enjoyed for years to come.
                        </p>
                        <p>
                            Proudly made in South Africa, every Zikiano piece is thoughtfully crafted with precision.
                            Exceptional quality and superior craftsmanship come together to bring a sense of luxury
                            to the everyday.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
