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
        <div className="min-h-screen bg-white">
            <div className="border-b border-black/10 bg-zikiano-stone">
                <div className="premium-container py-14 sm:py-20">
                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.34em] text-zinc-500">
                        Zikiano store
                    </p>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.85] tracking-tight text-black sm:text-8xl">
                            The Shop
                        </h1>
                        <p className="max-w-md text-sm font-semibold uppercase leading-6 tracking-[0.12em] text-zinc-600">
                            South African handmade footwear crafted with premium supplied fruit leather.
                            Bags and clothing are part of the label roadmap.
                        </p>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-2">
                        {["All", "Footwear", "Bags soon", "Clothing soon", "Paystack checkout"].map((item) => (
                            <span
                                key={item}
                                className="border border-black/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-700"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="premium-container py-6 sm:py-14">
                <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                        {groups.length} models / {totalColourways} colourways
                    </p>
                    <p className="hidden text-xs font-black uppercase tracking-[0.18em] text-zinc-500 sm:block">
                        Secure payments by Paystack
                    </p>
                </div>
                {groups.length === 0 ? (
                    <div className="border border-black/10 bg-white py-28 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">Collection loading</p>
                        <p className="mt-4 text-3xl font-black uppercase tracking-tight text-black">No products yet</p>
                        <p className="mt-3 text-sm font-medium text-zinc-500">Check back soon for the next Zikiano drop.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                        {groups.map((group) => (
                            <ShoeCard key={group.modelKey} group={group} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
