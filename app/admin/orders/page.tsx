import { supabase } from "@/lib/superbase";

export default async function AdminOrders() {
    const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="container">
            <h1>Orders</h1>
            {orders?.map((o) => (
                <div key={o.id}>
                    {o.email} – R {o.amount}
                </div>
            ))}
        </div>
    );
}
