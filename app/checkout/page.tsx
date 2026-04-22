"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/superbase";
import { usePaystackPayment } from "react-paystack";
import { Trash2, CreditCard, Loader2, MapPin, Package, ChevronRight } from "lucide-react";
import { verifyAndRecordOrder } from "@/app/actions/paystack";
import { sendOrderEmail } from "@/app/actions/sendOrderEmail";

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

export default function CartClient() {
    const router = useRouter();
    const { cart, removeFromCart, clearCart } = useStore();
    const [user,      setUser]      = useState<{ email: string } | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [loading,   setLoading]   = useState(false);

    const [showDelivery,   setShowDelivery]   = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<"address" | "postnet">("address");
    const [customerName,   setCustomerName]   = useState("");
    const [customerPhone,  setCustomerPhone]  = useState("");
    const [street,   setStreet]   = useState("");
    const [city,     setCity]     = useState("");
    const [province, setProvince] = useState("");
    const [postal,   setPostal]   = useState("");
    const [branch,   setBranch]   = useState(POSTNET_BRANCHES[0]);
    const [deliveryError, setDeliveryError] = useState("");

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) setUser({ email: data.user.email });
            setAuthReady(true);
        });
    }, []);

    const totalAmount = useMemo(() =>
            cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
        [cart]);

    const config = {
        reference: `ref_${Date.now()}`,
        email: user?.email || "pwkhoboko@gmail.com",
        amount: Math.round(totalAmount * 100),
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        currency: "ZAR",
    };

    const initializePayment = usePaystackPayment(config as any);

    function deliveryString() {
        return deliveryMethod === "address"
            ? `🏠 Home Delivery: ${street}, ${city}, ${province}, ${postal}`
            : `📦 PostNet: ${branch.name} (${branch.code})`;
    }

    function validateDelivery() {
        if (!customerName.trim())  return "Please enter your full name.";
        if (!customerPhone.trim()) return "Please enter your WhatsApp number.";
        if (deliveryMethod === "address" && (!street || !city || !province || !postal))
            return "Please fill in your complete delivery address.";
        return null;
    }

    function handleCheckoutClick() {
        setDeliveryError("");
        setShowDelivery(true);
        setTimeout(() => document.getElementById("delivery-form")?.scrollIntoView({ behavior: "smooth" }), 100);
    }

    function handleConfirmDelivery() {
        const err = validateDelivery();
        if (err) { setDeliveryError(err); return; }
        setDeliveryError("");
        initializePayment({ onSuccess: handleSuccess, onClose: () => {} });
    }

    const handleSuccess = async (reference: any) => {
        try {
            setLoading(true);

            const result = await verifyAndRecordOrder(reference.reference, cart, user?.email || "");
            if (!result.success) {
                alert("Payment verification failed. Please contact support.");
                return;
            }

            await sendOrderEmail({
                ref:           reference.reference,
                customerName,
                customerEmail:  user?.email || "pwkhoboko@gmail.com",
                customerPhone,
                items: cart.map(i => ({
                    name:     i.name,
                    price:    i.price,
                    quantity: i.quantity || 1,
                    sizes:    i.sizes,
                })),
                total:    totalAmount,
                delivery: deliveryString(),
            });

            clearCart();
            router.push("/success");

        } catch (err) {
            console.error("Payment Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen">
            <h1 className="text-3xl font-bold mb-10 uppercase tracking-tighter italic">Your Cart</h1>

            {cart.length === 0 ? (
                <div className="text-center py-24 border-t border-black">
                    <p className="text-gray-400 uppercase tracking-widest">Your bag is empty.</p>
                    <button onClick={() => router.push("/")} className="mt-6 text-black border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
                        CONTINUE SHOPPING
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* LEFT: cart items */}
                    <div className="lg:col-span-2 space-y-10">
                        {cart.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start gap-8 border-b border-gray-100 pb-10">
                                <div className="w-full sm:w-40 h-40 bg-[#f9f9f9] flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image"; }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="font-black text-xl uppercase leading-none mb-1">{item.name}</h2>
                                            <p className="text-gray-400 text-sm tracking-widest mb-4">{item.brand || "ZIKIANO"}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="bg-black text-white p-2 hover:bg-gray-800 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <div>{item.sizes && <p className="text-[10px] font-bold border border-black px-2 py-0.5 inline-block">SIZE: {item.sizes}</p>}</div>
                                        <p className="font-bold text-lg">R {item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: summary + delivery */}
                    <div className="h-fit lg:sticky lg:top-24 space-y-6">

                        {/* Summary */}
                        <div className="border-2 border-black p-8">
                            <h2 className="font-black text-2xl uppercase mb-6 italic">Summary</h2>
                            <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
                                <div className="flex justify-between text-gray-500 uppercase text-xs tracking-widest">
                                    <span>Subtotal</span><span>R {totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 uppercase text-xs tracking-widest">
                                    <span>Shipping</span><span className="text-black font-bold">COMPLIMENTARY</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-2xl font-black uppercase mb-8">
                                <span>Total</span><span>R {totalAmount.toLocaleString()}</span>
                            </div>

                            {/* Only show auth warning AFTER Supabase has responded */}
                            {authReady && !user && (
                                <p className="text-[10px] text-red-600 font-bold mb-4 text-center uppercase tracking-tighter">
                                    Authentication Required to Proceed
                                </p>
                            )}

                            {/* Show spinner while auth is resolving */}
                            {!authReady && (
                                <div className="flex justify-center mb-4">
                                    <Loader2 className="animate-spin text-gray-300" size={20} />
                                </div>
                            )}

                            <button
                                className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black border-2 border-black transition-all disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 flex items-center justify-center gap-3"
                                disabled={!authReady || !user || cart.length === 0 || loading}
                                onClick={handleCheckoutClick}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} />CHECKOUT</>}
                            </button>
                        </div>

                        {/* Delivery form */}
                        {showDelivery && (
                            <div id="delivery-form" className="border-2 border-black p-8">
                                <h2 className="font-black text-lg uppercase mb-1 italic tracking-tight">Delivery Details</h2>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-6">
                                    Order sent to our WhatsApp instantly after payment
                                </p>

                                <div className="space-y-3 mb-6">
                                    <input className={inp} placeholder="Full Name"                               value={customerName}  onChange={e => setCustomerName(e.target.value)} />
                                    <input className={inp} placeholder="Phone Number (e.g. 0821234567)" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-5">
                                    {(["address","postnet"] as const).map(m => (
                                        <button key={m} onClick={() => setDeliveryMethod(m)}
                                                className={`py-3 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${deliveryMethod === m ? "bg-black text-white border-black" : "bg-white text-black border-black hover:bg-gray-50"}`}>
                                            {m === "address" ? <><MapPin size={13} />Home</> : <><Package size={13} />PostNet</>}
                                        </button>
                                    ))}
                                </div>

                                {deliveryMethod === "address" && (
                                    <div className="space-y-3 mb-5">
                                        <input className={inp} placeholder="Street Address" value={street}   onChange={e => setStreet(e.target.value)} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input className={inp} placeholder="City"        value={city}    onChange={e => setCity(e.target.value)} />
                                            <input className={inp} placeholder="Postal Code" value={postal}  onChange={e => setPostal(e.target.value)} />
                                        </div>
                                        <select className={inp} value={province} onChange={e => setProvince(e.target.value)}>
                                            <option value="">Select Province</option>
                                            {PROVINCES.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                )}

                                {deliveryMethod === "postnet" && (
                                    <div className="space-y-3 mb-5">
                                        <select className={inp} value={branch.code} onChange={e => setBranch(POSTNET_BRANCHES.find(b => b.code === e.target.value)!)}>
                                            {POSTNET_BRANCHES.map(b => <option key={b.code} value={b.code}>{b.name} — {b.code}</option>)}
                                        </select>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Parcel addressed to this PostNet branch.</p>
                                    </div>
                                )}

                                {deliveryError && (
                                    <p className="text-[11px] text-red-600 font-bold uppercase tracking-tight mb-4">⚠ {deliveryError}</p>
                                )}

                                <button
                                    onClick={handleConfirmDelivery}
                                    disabled={loading}
                                    className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black border-2 border-black transition-all disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><CreditCard size={18} />PAY WITH PAYSTACK<ChevronRight size={15} /></>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const inp = "w-full border border-black px-4 py-3 text-sm uppercase tracking-wider placeholder:text-gray-400 placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-black bg-white";