"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

// ─── Set in .env.local ────────────────────────────────────────────────────────
// NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
// NEXT_PUBLIC_WHATSAPP_NUMBER=27821234567   ← your WhatsApp Business number
const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;
const WA_NUMBER    = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2784325376";

const POSTNET_BRANCHES = [
    { code: "CPT001", name: "Cape Town CBD" },
    { code: "CPT002", name: "Claremont" },
    { code: "JHB001", name: "Sandton City" },
    { code: "JHB002", name: "Rosebank" },
    { code: "DBN001", name: "Durban North" },
    { code: "PTA001", name: "Pretoria Hatfield" },
    { code: "PE001",  name: "Gqeberha Central" },
    { code: "BFN001", name: "Bloemfontein Mimosa" },
];

const PROVINCES = [
    "Western Cape","Gauteng","KwaZulu-Natal","Eastern Cape",
    "Limpopo","Mpumalanga","North West","Free State","Northern Cape",
];

export default function Checkout() {
    const { items } = useCart();
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // ── form state ─────────────────────────────────────────────────────────────
    const [method,    setMethod]    = useState<"address" | "postnet">("address");
    const [name,      setName]      = useState("");
    const [email,     setEmail]     = useState("");
    const [phone,     setPhone]     = useState("");
    const [street,    setStreet]    = useState("");
    const [city,      setCity]      = useState("");
    const [province,  setProvince]  = useState("");
    const [postal,    setPostal]    = useState("");
    const [branch,    setBranch]    = useState(POSTNET_BRANCHES[0]);
    const [error,     setError]     = useState("");
    const [loading,   setLoading]   = useState(false);

    // ── build WhatsApp message sent to YOUR number ─────────────────────────────
    function buildWaUrl(ref: string) {
        const delivery = method === "address"
            ? `🏠 *Home Delivery*\n${street}, ${city}, ${province}, ${postal}`
            : `📦 *PostNet:* ${branch.name} (${branch.code})`;

        const msg =
            `🛒 *New Order — PAID!*\n\n` +
            `*Ref:* ${ref}\n\n` +
            `👤 *Name:* ${name}\n` +
            `📧 *Email:* ${email}\n` +
            `📱 *Phone:* ${phone}\n\n` +
            `🧾 *Items:*\n` +
            items.map(i => `  • ${i.name} × ${i.quantity} — R${(i.price * i.quantity).toFixed(2)}`).join("\n") +
            `\n\n💰 *Total: R${total.toFixed(2)}*\n\n` +
            `📬 *Delivery:*\n${delivery}`;

        return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    }

    // ── validate ───────────────────────────────────────────────────────────────
    function validate() {
        if (!name.trim() || !email.trim() || !phone.trim())
            return "Please fill in all your contact details.";
        if (!/^\S+@\S+\.\S+$/.test(email))
            return "Please enter a valid email address.";
        if (method === "address" && (!street || !city || !province || !postal))
            return "Please fill in your complete delivery address.";
        return null;
    }

    // ── open Paystack ──────────────────────────────────────────────────────────
    function handlePay() {
        const err = validate();
        if (err) { setError(err); return; }
        setError("");
        setLoading(true);

        const launch = () => {
            // @ts-ignore — PaystackPop injected by inline script
            window.PaystackPop.setup({
                key:      PAYSTACK_KEY,
                email,
                amount:   total * 100,   // kobo / cents
                currency: "ZAR",
                ref:      `ORD-${Date.now()}`,
                metadata: {
                    custom_fields: [
                        { display_name: "Customer Name", variable_name: "customer_name", value: name },
                        { display_name: "Phone",         variable_name: "phone",         value: phone },
                        { display_name: "Delivery",      variable_name: "delivery",
                            value: method === "address"
                                ? `${street}, ${city}, ${province} ${postal}`
                                : `PostNet: ${branch.name} (${branch.code})`,
                        },
                    ],
                },
                onClose() { setLoading(false); },
                callback(res: { reference: string }) {
                    setLoading(false);
                    // ✅ redirect straight to WhatsApp with pre-filled order message
                    window.location.href = buildWaUrl(res.reference);
                },
            }).openIframe();
        };

        if (!document.getElementById("ps-script")) {
            const s = document.createElement("script");
            s.id = "ps-script";
            s.src = "https://js.paystack.co/v1/inline.js";
            s.onload = launch;
            document.body.appendChild(s);
        } else {
            launch();
        }
    }

    // ─── render ────────────────────────────────────────────────────────────────
    return (
        <div style={st.page}>
            <style>{css}</style>

            <div style={st.wrap}>

                {/* Header */}
                <div style={st.header}>
                    <span style={st.badge}>Secure Checkout</span>
                    <h1 style={st.h1}>Complete your order</h1>
                    <p style={st.sub}>Pay with Paystack · Order sent to our WhatsApp instantly</p>
                </div>

                {/* Order summary */}
                <div className="ch-card" style={{ marginBottom: 18 }}>
                    <p style={st.label}>Order Summary</p>
                    {items.map((item, i) => (
                        <div key={i} style={st.row}>
                            <span style={st.iname}>{item.name} <span style={st.qty}>× {item.quantity}</span></span>
                            <span style={st.iprice}>R{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ ...st.row, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, marginTop: 6 }}>
                        <span style={{ fontWeight: 600 }}>Total</span>
                        <span style={st.total}>R{total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Contact details */}
                <div className="ch-card" style={{ marginBottom: 14 }}>
                    <p style={st.label}>Your Details</p>
                    <div style={st.stack}>
                        <input className="ch-input" placeholder="Full Name"                             value={name}  onChange={e => setName(e.target.value)} />
                        <input className="ch-input" placeholder="Email Address"           type="email"  value={email} onChange={e => setEmail(e.target.value)} />
                        <input className="ch-input" placeholder="WhatsApp Number (e.g. 0821234567)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                </div>

                {/* Delivery method */}
                <div className="ch-card" style={{ marginBottom: 14 }}>
                    <p style={st.label}>Delivery Method</p>

                    <div style={st.tabs}>
                        {(["address","postnet"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setMethod(t)}
                                style={{ ...st.tab, ...(method === t ? st.tabOn : {}) }}
                            >
                                {t === "address" ? "🏠  Home Delivery" : "📦  PostNet"}
                            </button>
                        ))}
                    </div>

                    {method === "address" && (
                        <div style={st.stack}>
                            <input className="ch-input" placeholder="Street Address" value={street}   onChange={e => setStreet(e.target.value)} />
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                                <input className="ch-input" placeholder="City"        value={city}     onChange={e => setCity(e.target.value)} />
                                <input className="ch-input" placeholder="Postal Code" value={postal}   onChange={e => setPostal(e.target.value)} />
                            </div>
                            <select className="ch-input" value={province} onChange={e => setProvince(e.target.value)}>
                                <option value="">Select Province</option>
                                {PROVINCES.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                    )}

                    {method === "postnet" && (
                        <div style={st.stack}>
                            <select
                                className="ch-input"
                                value={branch.code}
                                onChange={e => setBranch(POSTNET_BRANCHES.find(b => b.code === e.target.value)!)}
                            >
                                {POSTNET_BRANCHES.map(b => (
                                    <option key={b.code} value={b.code}>{b.name} — {b.code}</option>
                                ))}
                            </select>
                            <p style={st.hint}>📍 Your parcel will be addressed to this PostNet branch.</p>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && <div style={st.err}>⚠️ {error}</div>}

                {/* Pay button */}
                <button className="ch-pay" onClick={handlePay} disabled={loading || items.length === 0}>
                    {loading
                        ? "Opening Paystack…"
                        : `🔒  Pay R${total.toFixed(2)} with Paystack`}
                </button>

                <p style={st.foot}>
                    After payment your order details are sent directly to our WhatsApp
                </p>
            </div>
        </div>
    );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const st: Record<string, React.CSSProperties> = {
    page:   { minHeight:"100vh", background:"#0c0c0c", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem 1rem", color:"#fff" },
    wrap:   { width:"100%", maxWidth:500 },
    header: { marginBottom:28 },
    badge:  { display:"inline-block", fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#00e676", background:"rgba(0,230,118,.1)", padding:"3px 10px", borderRadius:20, marginBottom:10 },
    h1:     { fontFamily:"'Syne',sans-serif", fontSize:"1.9rem", fontWeight:800, margin:"0 0 6px" },
    sub:    { color:"rgba(255,255,255,.35)", fontSize:13, margin:0 },
    label:  { fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"rgba(255,255,255,.28)", margin:"0 0 14px" },
    row:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,.05)" },
    iname:  { color:"rgba(255,255,255,.72)", fontSize:13.5 },
    qty:    { color:"rgba(255,255,255,.35)", fontSize:12 },
    iprice: { color:"#00e676", fontSize:13.5, fontWeight:600 },
    total:  { fontFamily:"'Syne',sans-serif", fontSize:"1.3rem", fontWeight:800, color:"#00e676" },
    stack:  { display:"flex", flexDirection:"column", gap:10 },
    tabs:   { display:"flex", gap:7, background:"rgba(255,255,255,.05)", borderRadius:11, padding:5, marginBottom:16 },
    tab:    { flex:1, padding:"10px 0", borderRadius:8, border:"none", background:"transparent", color:"rgba(255,255,255,.38)", fontSize:13.5, fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" },
    tabOn:  { background:"#00e676", color:"#000" },
    hint:   { color:"rgba(255,255,255,.22)", fontSize:12, margin:0 },
    err:    { background:"rgba(255,60,60,.1)", border:"1px solid rgba(255,60,60,.25)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#ff6b6b", marginBottom:14 },
    foot:   { textAlign:"center", color:"rgba(255,255,255,.18)", fontSize:11.5, marginTop:14 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; font-family:'DM Sans',sans-serif; }
  .ch-card {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 18px;
    padding: 20px;
  }
  .ch-input {
    width:100%;
    background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.1);
    border-radius:10px;
    padding:12px 14px;
    color:#fff;
    font-size:14px;
    outline:none;
    transition:border-color .2s;
  }
  .ch-input:focus { border-color:#00e676; }
  .ch-input::placeholder { color:rgba(255,255,255,.26); }
  .ch-input option { background:#1c1c1c; }
  .ch-pay {
    width:100%;
    padding:16px 0;
    background:linear-gradient(135deg,#00e676,#00897b);
    border:none;
    border-radius:13px;
    color:#fff;
    font-family:'Syne',sans-serif;
    font-weight:800;
    font-size:1rem;
    letter-spacing:.3px;
    cursor:pointer;
    transition:transform .15s, box-shadow .15s;
  }
  .ch-pay:hover:not(:disabled) {
    transform:translateY(-2px);
    box-shadow:0 10px 38px rgba(0,230,118,.35);
  }
  .ch-pay:disabled { opacity:.45; cursor:not-allowed; }
`;