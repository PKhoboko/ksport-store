"use server";

export async function verifyPayPalOrder(orderId: string, cart: any[], email: string) {
    // 1. Fetch order details from PayPal API
    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${await getPayPalAccessToken()}`,
        },
    });

    const order = await response.json();

    // 2. Validate status and amount
    if (order.status !== "COMPLETED") {
        return { success: false };
    }

    // 3. Record order in your database (Supabase, etc.)
    // ... your existing database logic ...

    return { success: true };
}

async function getPayPalAccessToken() {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await res.json();
    return data.access_token;
}