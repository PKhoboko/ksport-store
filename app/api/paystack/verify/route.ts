import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { reference } = await req.json();

    if (!reference) {
        return NextResponse.json({ error: "Payment reference is required" }, { status: 400 });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
        return NextResponse.json({ error: "Paystack secret key is not configured" }, { status: 500 });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
        return NextResponse.json({ error: data.message || "Unable to verify Paystack payment" }, { status: 400 });
    }

    return NextResponse.json({
        success: data.data.status === "success",
        status: data.data.status,
        reference: data.data.reference,
        amount: data.data.amount,
        currency: data.data.currency,
    });
}
