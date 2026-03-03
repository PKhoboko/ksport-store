import { supabase } from '@/lib/superbase';

export default async function InventoryList() {
    const { data: shoes } = await supabase.from('shoes').select('*');

    return (
        <div className="p-10">
            <h1 className="text-2xl font-black italic mb-8 uppercase">ZIKIANO INVENTORY</h1>
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <th className="py-4">Product</th>
                    <th>Status</th>
                    <th>Price</th>
                </tr>
                </thead>
                <tbody>
                {shoes?.map(shoe => (
                    <tr key={shoe.id} className="border-b">
                        <td className="py-4 font-bold">{shoe.name}</td>
                        <td>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${shoe.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {shoe.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                </span>
                        </td>
                        <td className="font-black italic">R{shoe.price}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}