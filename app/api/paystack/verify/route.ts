import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { items, email } = await req.json();

    if (!items || items.length === 0) {
        return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const totalAmount = items.reduce((sum: number, item: any) => {
        return sum + item.price * (item.quantity || 1);
    }, 0);

    // ── PayPal ────────────────────────────────────────────────────────────────

    // Step 1: Get access token
    const credentials = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch(
        `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        }
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        return NextResponse.json(
            { error: "Failed to authenticate with PayPal" },
            { status: 500 }
        );
    }

    // Step 2: Create order
    const orderRes = await fetch(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD", // Change to your currency e.g. "ZAR" if supported
                            value: totalAmount.toFixed(2),
                        },
                        description: items
                            .map((item: any) => `${item.name} x${item.quantity || 1}`)
                            .join(", "),
                    },
                ],
                payment_source: {
                    paypal: {
                        experience_context: {
                            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
                            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
                            user_action: "PAY_NOW",
                        },
                    },
                },
            }),
        }
    );

    const orderData = await orderRes.json();

    if (orderData.status !== "PAYER_ACTION_REQUIRED") {
        return NextResponse.json(
            { error: orderData.message || "Failed to create PayPal order" },
            { status: 400 }
        );
    }

    // Find the payer-action approval link
    const approvalUrl = orderData.links?.find(
        (link: any) => link.rel === "payer-action"
    )?.href;

    if (!approvalUrl) {
        return NextResponse.json(
            { error: "No approval URL returned from PayPal" },
            { status: 500 }
        );
    }

    return NextResponse.json({ url: approvalUrl });

    // ── Paystack (commented out for future use) ───────────────────────────────

    // const res = await fetch("https://api.paystack.co/transaction/initialize", {
    //     method: "POST",
    //     headers: {
    //         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //         email,
    //         amount: 2, //// amount: totalAmount (in kobo/cents)
    //         currency: "ZAR",
    //         callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    //         metadata: {
    //             items: items.map((item: any) => ({
    //                 name: item.name,
    //                 quantity: item.quantity || 1,
    //                 price: item.price,
    //             })),
    //         },
    //     }),
    // });

    // const data = await res.json();

    // if (!data.status) {
    //     return NextResponse.json({ error: data.message }, { status: 400 });
    // }

    // return NextResponse.json({ url: data.data.authorization_url });
}