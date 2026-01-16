"use client";
import { useState } from 'react';
import { supabase } from '@/lib/superbase';

export default function AdminPage() {
    const [form, setForm] = useState({ name: '', brand: '', price: '', description: '', category: '', stock: '5' });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);

        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from('shoe-images').upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from('shoe-images').getPublicUrl(fileName);

        await supabase.from('shoes').insert([{
            ...form,
            price: parseInt(form.price),
            stock: parseInt(form.stock),
            image_url: publicUrl,
            sizes: [7, 8, 9, 10, 11]
        }]);

        setLoading(false);
        alert("Live in store!");
    };

    return (
        <div className="max-w-xl mx-auto py-20 px-6">
            <h1 className="text-3xl font-black mb-10">INVENTORY INTAKE</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full p-4 border rounded-xl" required />
                <input placeholder="Product Name" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, name: e.target.value})} required />
                <input placeholder="Brand" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, brand: e.target.value})} required />
                <input placeholder="Price (ZAR)" type="number" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, price: e.target.value})} required />
                <textarea placeholder="Description" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, description: e.target.value})} required />
                <button disabled={loading} className="w-full bg-black text-white p-5 rounded-xl font-bold uppercase tracking-widest">
                    {loading ? "Uploading to Cloud..." : "Publish to Storefront"}
                </button>
            </form>
        </div>
    );
}