"use client";
import { useState } from 'react';
import { supabase } from '@/lib/superbase';

export default function AddProduct() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', brand: 'ZIKIANO', price: '', stock: '', desc: '' });
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Upload Image to Supabase Storage
        if (!file) return alert("Select an image first");
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData } = await supabase.storage.from('shoe-images').upload(fileName, file);

        const { data: { publicUrl } } = supabase.storage.from('shoe-images').getPublicUrl(fileName);

        // 2. Insert Data into Table
        const { error } = await supabase.from('shoes').insert([{
            name: form.name,
            brand: form.brand,
            price: parseInt(form.price),
            stock: parseInt(form.stock),
            description: form.desc,
            image_url: publicUrl
        }]);

        if (!error) alert("Product added to ZIKIANO collection!");
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto py-20 px-6">
            <h1 className="text-3xl font-black italic mb-8">ADD TO COLLECTION</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-4 border rounded-xl" />
                <input placeholder="Shoe Name" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="Price (R)" type="number" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, price: e.target.value})} />
                <input placeholder="Stock Quantity" type="number" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, stock: e.target.value})} />
                <textarea placeholder="Description" className="w-full p-4 border rounded-xl h-32" onChange={e => setForm({...form, desc: e.target.value})} />
                <button disabled={loading} className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest">
                    {loading ? "Uploading..." : "Publish to Store"}
                </button>
            </form>
        </div>
    );
}