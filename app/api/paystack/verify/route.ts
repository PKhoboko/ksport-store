import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { items, email } = await req.json();

    if (!items || items.length === 0) {
        return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const totalAmount = items.reduce((sum: number, item: any) => {
        return sum + Math.round(item.price * 100) * (item.quantity || 1);
    }, 0);

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            amount: totalAmount,
            currency: "ZAR",
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
            metadata: {
                items: items.map((item: any) => ({
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: item.price,
                })),
            },
        }),
    });

    const data = await res.json();

    if (!data.status) {
        return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.data.authorization_url });
}