"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailPayload {
    ref: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: { name: string; price: number; quantity: number; sizes: number[] }[];
    total: number;
    delivery: string;
}

function itemRows(items: OrderEmailPayload["items"]) {
    return items.map(i => `
        <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #eee">
                ${i.name}${i.sizes ? ` (Size: ${i.sizes})` : ""}
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right">R ${(i.price * i.quantity).toLocaleString()}</td>
        </tr>`).join("");
}

function ownerEmailHtml(p: OrderEmailPayload) {
    return `
    <div style="font-family:sans-serif;max-width:620px;margin:auto;color:#111">
        <div style="background:#000;color:#fff;padding:22px 28px">
            <h1 style="margin:0;font-size:20px;letter-spacing:3px;font-weight:900">NEW ORDER RECEIVED</h1>
            <p style="margin:6px 0 0;font-size:12px;opacity:.6">Ref: ${p.ref}</p>
        </div>
        <div style="padding:28px">
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px">
                <tr><td style="padding:6px 0;color:#888;width:140px">Customer</td><td style="padding:6px 0;font-weight:700">${p.customerName}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0">${p.customerEmail}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Phone</td><td style="padding:6px 0">${p.customerPhone}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Delivery</td><td style="padding:6px 0">${p.delivery}</td></tr>
            </table>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
                <thead>
                    <tr style="background:#f5f5f5">
                        <th style="padding:10px 14px;text-align:left;font-size:11px;letter-spacing:1px">ITEM</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;letter-spacing:1px">QTY</th>
                        <th style="padding:10px 14px;text-align:right;font-size:11px;letter-spacing:1px">PRICE</th>
                    </tr>
                </thead>
                <tbody>${itemRows(p.items)}</tbody>
            </table>
            <div style="text-align:right;margin-top:16px;font-size:20px;font-weight:900">
                TOTAL: R ${p.total.toLocaleString()}
            </div>
        </div>
    </div>`;
}

function customerEmailHtml(p: OrderEmailPayload) {
    return `
    <div style="font-family:sans-serif;max-width:620px;margin:auto;color:#111">
        <div style="background:#000;color:#fff;padding:22px 28px">
            <h1 style="margin:0;font-size:20px;letter-spacing:3px;font-weight:900">ORDER CONFIRMED</h1>
            <p style="margin:6px 0 0;font-size:12px;opacity:.6">Ref: ${p.ref}</p>
        </div>
        <div style="padding:28px">
            <p style="font-size:15px">Hi <strong>${p.customerName}</strong>,</p>
            <p style="font-size:14px;color:#444;line-height:1.6">
                Thank you for your order! We have received your payment and will start processing it right away.
                You will be contacted once your order is on its way.
            </p>
            <div style="background:#f9f9f9;border-left:3px solid #000;padding:14px 18px;margin:20px 0;font-size:13px">
                <strong>Delivery:</strong> ${p.delivery}
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
                <thead>
                    <tr style="background:#f5f5f5">
                        <th style="padding:10px 14px;text-align:left;font-size:11px;letter-spacing:1px">ITEM</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;letter-spacing:1px">QTY</th>
                        <th style="padding:10px 14px;text-align:right;font-size:11px;letter-spacing:1px">PRICE</th>
                    </tr>
                </thead>
                <tbody>${itemRows(p.items)}</tbody>
            </table>
            <div style="text-align:right;margin-top:16px;font-size:20px;font-weight:900">
                TOTAL: R ${p.total.toLocaleString()}
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:28px 0"/>
            <p style="font-size:12px;color:#aaa;text-align:center">
                Questions? Simply reply to this email. Thank you for shopping with us!
            </p>
        </div>
    </div>`;
}

export async function sendOrderEmail(payload: OrderEmailPayload) {
    console.log("=== sendOrderEmail called ===");
    console.log("ENV CHECK:", {
        hasApiKey:     !!process.env.RESEND_API_KEY,
        storeEmail:    process.env.STORE_OWNER_EMAIL,
        fromEmail:     process.env.FROM_EMAIL,
        customerEmail:"pwkhoboko@gmail.com" ,//payload.customerEmail
        delivery:      payload.delivery,
    });

    const FROM    = process.env.FROM_EMAIL!;
    const TO_OWNER = process.env.STORE_OWNER_EMAIL!;

    if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
    if (!FROM)      throw new Error("Missing FROM_EMAIL");
    if (!TO_OWNER)  throw new Error("Missing STORE_OWNER_EMAIL");

    // Send to owner
    const toOwner = await resend.emails.send({
        from:    FROM,
        to:      TO_OWNER,
        subject: `New Order ${payload.ref} — R ${payload.total.toLocaleString()}`,
        html:    ownerEmailHtml(payload),
    });

    if (toOwner.error) {
        console.error("OWNER EMAIL FAILED:", JSON.stringify(toOwner.error));
        throw new Error(`Owner email failed: ${toOwner.error.message}`);
    }

    console.log("Owner email sent OK:", toOwner.data);

    // Send to customer (only if they have an email)
    if (payload.customerEmail) {
        const toCustomer = await resend.emails.send({
            from:    FROM,
            to:     "pwkhoboko@gmail.com" ,//payload.customerEmail
            subject: `Order Confirmed — Ref: ${payload.ref}`,
            html:    customerEmailHtml(payload),
        });

        if (toCustomer.error) {
            console.error("CUSTOMER EMAIL FAILED:", JSON.stringify(toCustomer.error));
            throw new Error(`Customer email failed: ${toCustomer.error.message}`);
        }

        console.log("Customer email sent OK:", toCustomer.data);
    }

    return { success: true };
}