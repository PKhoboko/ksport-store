/**
 * app/shop/page.tsx
 */
import { supabase } from '@/lib/superbase';
import ShoeCard from '@/components/ShoeCard';
import { groupShoes } from '@/lib/Groupshoes';

export const revalidate = 0;

export default async function ShopPage() {
    const { data: shoes, error } = await supabase
        .from('shoes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error('Supabase error:', error.message);

    const { groups } = groupShoes(shoes ?? []);
    const totalColourways = groups.reduce((acc, g) => acc + g.variants.length, 0);

    return (
        <div className="min-h-screen bg-zinc-50">

            {/* Shop header */}
            <div className="bg-white border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-14">
                    <p className="text-[8px] sm:text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase mb-1 sm:mb-2">
                        Zikiano
                    </p>
                    <h1 className="text-3xl sm:text-7xl font-black italic tracking-tighter text-zinc-900 leading-none">
                        The Shop
                    </h1>
                    <p className="text-[9px] sm:text-xs text-zinc-400 font-medium mt-2 sm:mt-3">
                        {groups.length} models &nbsp;·&nbsp; {totalColourways} colourways
                    </p>
                </div>
            </div>

            {/*
        Mobile:  2 columns — tight gap, cards are small and scannable
        Desktop: 3–4 columns
      */}
            <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-14">
                {groups.length === 0 ? (
                    <div className="text-center py-32 text-zinc-400">
                        <p className="text-5xl mb-4">👟</p>
                        <p className="font-black uppercase tracking-widest text-sm">No shoes yet</p>
                        <p className="text-xs mt-2 font-medium">Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                          gap-2 sm:gap-6 lg:gap-8">
                        {groups.map((group) => (
                            <ShoeCard key={group.modelKey} group={group} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}