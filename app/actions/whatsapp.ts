"use server";

// app/actions/whatsapp.ts
//
// Sends a WhatsApp message DIRECTLY to your phone via Meta Cloud API.
// No customer interaction needed — fires automatically after payment.
//
// ─── ONE-TIME SETUP (~15 mins) ───────────────────────────────────────────────
//
// 1. Go to https://developers.facebook.com/apps/create/ → Choose "Business"
//
// 2. Inside your new app → Add Product → WhatsApp → Set Up
//
// 3. WhatsApp → API Setup page:
//    Copy "Temporary access token"  → WHATSAPP_TOKEN
//    Copy "Phone number ID"         → WHATSAPP_PHONE_NUMBER_ID
//
// 4. Under "To:" add YOUR WhatsApp number as a test recipient
//    e.g. +27 84 325 376 → enter as 27843253760
//    Copy that number    → WHATSAPP_RECIPIENT_NUMBER
//    Hit "Send Message"  → you should get a test message on your phone ✅
//
// 5. Add to .env.local:
//    WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxx
//    WHATSAPP_PHONE_NUMBER_ID=123456789012345
//    WHATSAPP_RECIPIENT_NUMBER=27843253760
//
// 6. For production (permanent token — temporary ones expire in 24hrs!):
//    → business.facebook.com → Settings → System Users
//    → Create system user → assign WhatsApp app → Generate token (no expiry)
//    → Replace WHATSAPP_TOKEN with the permanent token
//
// ─────────────────────────────────────────────────────────────────────────────

export async function sendOrderToWhatsApp({
                                              ref,
                                              customerName,
                                              customerEmail,
                                              customerPhone,
                                              items,
                                              total,
                                              delivery,
                                          }: {
    ref:           string;
    customerName:  string;
    customerEmail: string;
    customerPhone: string;
    items:         { name: string; price: number; quantity: number; sizes: number[] }[];
    total:         number;
    delivery:      string;
}) {
    const TOKEN     = process.env.WHATSAPP_TOKEN;
    const PHONE_ID  = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const RECIPIENT = process.env.WHATSAPP_RECIPIENT_NUMBER;

    if (!TOKEN || !PHONE_ID || !RECIPIENT) {
        console.error("❌ Missing WhatsApp env vars — need: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_RECIPIENT_NUMBER");
        return { success: false };
    }

    const itemLines = items
        .map(i => `  • ${i.name}${i.sizes ? ` (${i.sizes})` : ""} × ${i.quantity} — R${(i.price * i.quantity).toLocaleString()}`)
        .join("\n");

    const message =
        `🛒 *New Order — PAID!*\n\n` +
        `*Ref:* ${ref}\n\n` +
        `👤 *Name:* ${customerName}\n` +
        `📧 *Email:* ${customerEmail}\n` +
        `📱 *Phone:* ${customerPhone}\n\n` +
        `🧾 *Items:*\n${itemLines}\n\n` +
        `💰 *Total: R${total.toLocaleString()}*\n\n` +
        `📬 *Delivery:*\n${delivery}`;

    const res = await fetch(
        `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to:   RECIPIENT,
                type: "text",
                text: { body: message },
            }),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        console.error("❌ WhatsApp API error:", JSON.stringify(data, null, 2));
        return { success: false, error: data };
    }

    console.log("✅ WhatsApp sent. Message ID:", data.messages?.[0]?.id);
    return { success: true };
}