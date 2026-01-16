"use client";
import { useCart } from '@/lib/store';
import { createCheckout } from '@/app/actions/checkout';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;
    const total = cart.reduce((acc, item) => acc + item.price, 0);

    const handlePay = async () => {
        setLoading(true);
        const { url } = await createCheckout(cart);
        if (url) window.location.href = url;
    };

    return (
        <div className="max-w-3xl mx-auto p-6 py-20">
            <h1 className="text-4xl font-black mb-10 tracking-tighter">YOUR SELECTION</h1>
            {cart.length === 0 ? <p className="text-zinc-400">Bag is empty.</p> : (
                <div className="space-y-8">
                    {cart.map((item, i) => (
                        <div key={i} className="flex gap-6 items-center border-b pb-8">
                            <img src={item.image_url} className="w-20 h-20 object-cover rounded-xl" />
                            <div className="flex-1">
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-zinc-500">R{item.price}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)}><Trash2 size={18} className="text-zinc-300 hover:text-red-500"/></button>
                        </div>
                    ))}
                    <div className="text-right pt-10">
                        <p className="text-3xl font-black mb-6">Total: R{total}</p>
                        <button onClick={handlePay} disabled={loading} className="w-full bg-black text-white py-5 rounded-full font-bold uppercase tracking-widest">
                            {loading ? "Preparing Secure Checkout..." : "Check Out via Stripe"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}