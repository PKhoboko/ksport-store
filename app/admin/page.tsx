"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, Loader2, LogOut, PackagePlus, Pencil, ShieldCheck, Trash2, X } from "lucide-react";

type ProductImage = {
    id: string | number;
    name: string;
    brand: string | null;
    price: number;
    original_price: number | null;
    stock: number;
    description: string | null;
    category: string | null;
    color_label: string | null;
    size: string | null;
    image_url: string;
};

type ProductForm = {
    name: string;
    brand: string;
    price: string;
    original_price: string;
    stock: string;
    description: string;
    category: string;
    color_label: string;
    size: string;
};

const emptyForm: ProductForm = {
    name: "", brand: "ZIKIANO", price: "", original_price: "", stock: "1",
    description: "", category: "Footwear", color_label: "", size: "",
};

function money(value: number) {
    return `R ${Number(value).toLocaleString("en-ZA")}`;
}

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [secret, setSecret] = useState("");
    const [products, setProducts] = useState<ProductImage[]>([]);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [files, setFiles] = useState<File[]>([]);
    const [busy, setBusy] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState<ProductImage | null>(null);
    const [editPrice, setEditPrice] = useState("");
    const [editOriginalPrice, setEditOriginalPrice] = useState("");
    const [editStock, setEditStock] = useState("");

    const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
    useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);

    const request = async (url: string, options?: RequestInit) => {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
        return data;
    };

    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const data = await request("/api/admin/products");
            setProducts(data.products);
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Unable to load products.";
            setError(message);
            if (message.includes("session has expired")) setAuthenticated(false);
        } finally {
            setLoadingProducts(false);
        }
    };

    const signIn = async (event: FormEvent) => {
        event.preventDefault();
        setBusy(true); setError("");
        try {
            await request("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret }) });
            setSecret(""); setAuthenticated(true); setNotice("Signed in securely.");
            await loadProducts();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to sign in.");
        } finally { setBusy(false); }
    };

    const uploadProduct = async (event: FormEvent) => {
        event.preventDefault();
        if (!files.length) { setError("Please select at least one product image."); return; }
        setBusy(true); setError(""); setNotice("");
        try {
            const data = new FormData();
            Object.entries(form).forEach(([key, value]) => data.append(key, value));
            files.forEach((file) => data.append("images", file));
            await request("/api/admin/products", { method: "POST", body: data });
            setForm(emptyForm); setFiles([]); setNotice("Product published to the store.");
            await loadProducts();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to publish product.");
        } finally { setBusy(false); }
    };

    const openEdit = (item: ProductImage) => {
        setEditing(item); setEditPrice(String(item.price));
        setEditOriginalPrice(item.original_price ? String(item.original_price) : ""); setEditStock(String(item.stock));
        setError(""); setNotice("");
    };

    const savePricing = async () => {
        if (!editing) return;
        setBusy(true); setError("");
        try {
            await request("/api/admin/products", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editing.id, price: editPrice, original_price: editOriginalPrice, stock: editStock }),
            });
            setEditing(null); setNotice("Price and stock updated for every image of this product.");
            await loadProducts();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to update product.");
        } finally { setBusy(false); }
    };

    const deleteImage = async (item: ProductImage) => {
        if (!window.confirm(`Remove this image for ${item.name}? This cannot be undone.`)) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await request("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
            setNotice("Image removed from the store."); await loadProducts();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to remove image.");
        } finally { setBusy(false); }
    };

    const signOut = async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        setAuthenticated(false); setProducts([]); setNotice(""); setError("");
    };

    const changeForm = (field: keyof ProductForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((current) => ({ ...current, [field]: event.target.value }));

    if (!authenticated) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
                <form onSubmit={signIn} className="mx-auto max-w-md border border-white/10 bg-zinc-900 p-8 shadow-2xl sm:p-10">
                    <ShieldCheck className="mb-6 text-zikiano-signal" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zikiano-signal">Zikiano administration</p>
                    <h1 className="mt-3 text-4xl font-black uppercase tracking-tight">Manage your store</h1>
                    <p className="mt-4 text-sm leading-6 text-zinc-400">Sign in to upload product images, set sale prices, update stock, and remove images.</p>
                    <label className="mt-8 block text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">Admin password</label>
                    <input value={secret} onChange={(event) => setSecret(event.target.value)} type="password" required autoFocus className="mt-2 h-12 w-full border border-white/15 bg-black px-4 text-sm outline-none focus:border-zikiano-signal" />
                    {error && <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>}
                    <button disabled={busy} className="mt-6 flex h-12 w-full items-center justify-center bg-zikiano-signal text-xs font-black uppercase tracking-[0.2em] text-black disabled:opacity-60">
                        {busy ? <Loader2 className="animate-spin" size={17} /> : "Sign in"}
                    </button>
                </form>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-100 px-4 py-8 text-black sm:px-6 sm:py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">Zikiano administration</p><h1 className="mt-2 text-4xl font-black uppercase tracking-tight sm:text-5xl">Product manager</h1></div>
                    <button onClick={signOut} className="inline-flex h-11 items-center justify-center gap-2 border border-black/15 px-4 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-black hover:text-white"><LogOut size={15} /> Sign out</button>
                </div>
                {(error || notice) && <div className={`mb-6 flex items-center gap-2 border px-4 py-3 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{error ? <X size={16} /> : <Check size={16} />}{error || notice}</div>}

                <section className="border border-black/10 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-6 flex items-center gap-3"><PackagePlus size={22} /><div><h2 className="font-black uppercase tracking-tight">Add a product</h2><p className="mt-1 text-xs text-zinc-500">Add all product photos together. They will appear as one product gallery.</p></div></div>
                    <form onSubmit={uploadProduct} className="grid gap-4 md:grid-cols-2">
                        <input value={form.name} onChange={changeForm("name")} required placeholder="Product name" className="input" />
                        <input value={form.color_label} onChange={changeForm("color_label")} placeholder="Colour (e.g. Tan)" className="input" />
                        <input value={form.price} onChange={changeForm("price")} required min="1" type="number" placeholder="Selling price (R)" className="input" />
                        <input value={form.original_price} onChange={changeForm("original_price")} min="1" type="number" placeholder="Original price (optional, for sale)" className="input" />
                        <input value={form.stock} onChange={changeForm("stock")} required min="0" type="number" placeholder="Stock quantity" className="input" />
                        <input value={form.size} onChange={changeForm("size")} placeholder="Size (optional)" className="input" />
                        <select value={form.category} onChange={changeForm("category")} className="input"><option>Footwear</option><option>Bags</option><option>Clothing</option></select>
                        <input value={form.brand} onChange={changeForm("brand")} placeholder="Brand" className="input" />
                        <textarea value={form.description} onChange={changeForm("description")} placeholder="Description (optional)" className="input min-h-28 md:col-span-2" />
                        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-black/25 bg-zinc-50 px-4 text-center md:col-span-2 hover:border-black"><ImagePlus size={22} /><span className="mt-2 text-[10px] font-black uppercase tracking-[0.18em]">Choose product images</span><span className="mt-1 text-xs text-zinc-500">You can select more than one image.</span><input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label>
                        {previews.length > 0 && <div className="flex flex-wrap gap-3 md:col-span-2">{previews.map(({ file, url }) => <div key={url} className="relative h-20 w-20 border border-black/10"><img src={url} alt={file.name} className="h-full w-full object-cover" /><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((selected) => selected !== file))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><X size={13} /></button></div>)}</div>}
                        <button disabled={busy} className="flex h-12 items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-zinc-800 disabled:opacity-60 md:col-span-2">{busy ? <Loader2 className="animate-spin" size={16} /> : <PackagePlus size={16} />}{busy ? "Saving..." : "Publish product"}</button>
                    </form>
                </section>

                <section className="mt-8 border border-black/10 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-6 flex items-center justify-between"><div><h2 className="font-black uppercase tracking-tight">Store images</h2><p className="mt-1 text-xs text-zinc-500">Edit prices and stock, or remove an individual image.</p></div><span className="text-xs font-black text-zinc-500">{products.length} images</span></div>
                    {loadingProducts ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div> : products.length === 0 ? <p className="py-12 text-center text-sm text-zinc-500">No product images yet.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((item) => <article key={item.id} className="overflow-hidden border border-black/10"><img src={item.image_url} alt={item.name} className="aspect-square w-full bg-zinc-100 object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black uppercase tracking-tight">{item.name}</h3><p className="mt-1 text-xs font-semibold text-zinc-500">{item.color_label || "Default"}</p></div><p className="shrink-0 text-sm font-black">{money(item.price)}</p></div>{item.original_price && item.original_price > item.price && <p className="mt-1 text-xs text-zinc-400 line-through">{money(item.original_price)}</p>}<p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">{item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}</p><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => openEdit(item)} className="flex h-10 items-center justify-center gap-2 border border-black text-[10px] font-black uppercase tracking-[0.14em]"><Pencil size={14} /> Edit</button><button onClick={() => deleteImage(item)} disabled={busy} className="flex h-10 items-center justify-center gap-2 border border-red-200 text-[10px] font-black uppercase tracking-[0.14em] text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} /> Remove</button></div></div></article>)}</div>}
                </section>
            </div>

            {editing && <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-4 sm:items-center sm:justify-center"><div className="w-full max-w-md bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Edit product</p><h2 className="mt-1 text-2xl font-black uppercase tracking-tight">{editing.name}</h2></div><button onClick={() => setEditing(null)} aria-label="Close"><X /></button></div><p className="mt-3 text-xs leading-5 text-zinc-500">These changes apply to every image in this product gallery.</p><div className="mt-6 grid gap-4"><input value={editPrice} onChange={(event) => setEditPrice(event.target.value)} type="number" min="1" placeholder="Selling price (R)" className="input" /><input value={editOriginalPrice} onChange={(event) => setEditOriginalPrice(event.target.value)} type="number" min="1" placeholder="Original price (optional)" className="input" /><input value={editStock} onChange={(event) => setEditStock(event.target.value)} type="number" min="0" placeholder="Stock quantity" className="input" /></div><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => setEditing(null)} className="h-11 border border-black/15 text-[10px] font-black uppercase tracking-[0.16em]">Cancel</button><button onClick={savePricing} disabled={busy} className="h-11 bg-black text-[10px] font-black uppercase tracking-[0.16em] text-white disabled:opacity-50">{busy ? "Saving..." : "Save changes"}</button></div></div></div>}
            <style jsx>{`.input { width: 100%; border: 1px solid rgba(0,0,0,.15); min-height: 48px; padding: 12px 14px; font-size: 14px; outline: none; } .input:focus { border-color: #050505; } textarea.input { padding-top: 14px; }`}</style>
        </main>
    );
}
