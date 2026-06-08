import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { items, email, customer } = await req.json();

    if (!items || items.length === 0) {
        return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!email) {
        return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
        return NextResponse.json({ error: "Paystack secret key is not configured" }, { status: 500 });
    }

    const totalAmount = items.reduce((sum: number, item: any) => {
        return sum + Number(item.price || 0) * (item.quantity || 1);
    }, 0);

    const reference = `zikiano-${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            amount: Math.round(totalAmount * 100),
            currency: "ZAR",
            reference,
            callback_url: `${baseUrl}/success?reference=${reference}`,
            metadata: {
                customer,
                items: items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: item.price,
                    sizes: item.sizes,
                })),
            },
        }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
        return NextResponse.json({ error: data.message || "Unable to initialize Paystack" }, { status: 400 });
    }

    return NextResponse.json({
        url: data.data.authorization_url,
        reference: data.data.reference || reference,
    });
}
