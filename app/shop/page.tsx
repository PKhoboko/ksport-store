import { supabase } from "@/lib/superbase";
export const revalidate = 0;

export default async function ShopPage() {
    const { data: products, error } = await supabase.from("shoes").select("*");

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
