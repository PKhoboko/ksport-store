import { supabase } from "@/lib/superbase";

export default async function ShopPage() {
    const { data: products } = await supabase.from("products").select("*");

    return (
        <div className="container">
            <h1>Shop</h1>
            <div className="product-grid">
                {products?.map((p) => (
                    <div key={p.id} className="card">
                        <img src={p.image_url} alt={p.name} />
                        <h3>{p.name}</h3>
                        <p>R {p.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
