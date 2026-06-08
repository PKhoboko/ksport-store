"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/superbase";
import { Trash2, CreditCard, Loader2, MapPin, Package, ChevronRight } from "lucide-react";

const POSTNET_BRANCHES = [
    { code: "CPT001", name: "Cape Town CBD" },
    { code: "CPT002", name: "Claremont" },
    { code: "JHB001", name: "Sandton City" },
    { code: "JHB002", name: "Rosebank" },
    { code: "DBN001", name: "Durban North" },
    { code: "PTA001", name: "Pretoria Hatfield" },
    { code: "PE001", name: "Gqeberha Central" },
    { code: "BFN001", name: "Bloemfontein Mimosa" },
];

const PROVINCES = [
    "Western Cape", "Gauteng", "KwaZulu-Natal", "Eastern Cape",
    "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape",
];

export default function CartClient() {
    const router = useRouter();
    const { cart, removeFromCart } = useStore();
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showDelivery, setShowDelivery] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<"address" | "postnet">("address");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState("");
    const [postal, setPostal] = useState("");
    const [branch, setBranch] = useState(POSTNET_BRANCHES[0]);
    const [deliveryError, setDeliveryError] = useState("");

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) setUser({ email: data.user.email });
            setAuthReady(true);
        });
    }, []);

    const totalAmount = useMemo(
        () => cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
        [cart]
    );

    function deliveryString() {
        return deliveryMethod === "address"
            ? `Home Delivery: ${street}, ${city}, ${province}, ${postal}`
            : `PostNet: ${branch.name} (${branch.code})`;
    }

    function validateDelivery() {
        if (!customerName.trim()) return "Please enter your full name.";
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

    async function handlePaystackCheckout() {
        const err = validateDelivery();
        if (err) {
            setDeliveryError(err);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart,
                    email: user?.email || "",
                    customer: {
                        name: customerName,
                        phone: customerPhone,
                        delivery: deliveryString(),
                    },
                }),
            });
            const data = await response.json();

            if (!response.ok || !data.url) {
                setDeliveryError(data.error || "Paystack checkout could not be started.");
                return;
            }

            window.location.href = data.url;
        } catch (err) {
            console.error("Paystack checkout error:", err);
            setDeliveryError("Payment could not be started. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="premium-container min-h-screen py-8 sm:py-14">
            <div className="mb-10 flex flex-col gap-3 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Secure bag</p>
                    <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">Your Cart</h1>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Paystack checkout only</p>
            </div>

            {cart.length === 0 ? (
                <div className="border border-black/10 py-24 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-400">Your bag is empty.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 border-b border-black pb-1 text-xs font-black uppercase tracking-[0.18em] text-black transition-colors hover:text-zinc-500"
                    >
                        CONTINUE SHOPPING
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
                    {/* LEFT: cart items */}
                    <div className="lg:col-span-2 space-y-10">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col items-start gap-6 border-b border-black/10 pb-8 sm:flex-row"
                            >
                                <div className="flex h-44 w-full flex-shrink-0 items-center justify-center overflow-hidden bg-zikiano-stone sm:w-40">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://via.placeholder.com/150?text=No+Image";
                                        }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="mb-1 text-xl font-black uppercase leading-none tracking-tight">
                                                {item.name}
                                            </h2>
                                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                                {item.brand || "ZIKIANO"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="bg-black p-2 text-white transition-colors hover:bg-zinc-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <div>
                                            {item.sizes && (
                                                <p className="text-[10px] font-bold border border-black px-2 py-0.5 inline-block">
                                                    SIZE: {Array.isArray(item.sizes) ? item.sizes.join(", ") : item.sizes}
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-bold text-lg">R {item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: summary + delivery */}
                    <div className="h-fit lg:sticky lg:top-24 space-y-6">
                        {/* Summary */}
                        <div className="border border-black p-6 sm:p-8">
                            <h2 className="mb-6 text-2xl font-black uppercase tracking-tight">Summary</h2>
                            <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
                                <div className="flex justify-between text-gray-500 uppercase text-xs tracking-widest">
                                    <span>Subtotal</span>
                                    <span>R {totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 uppercase text-xs tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-black font-bold">COMPLIMENTARY</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-2xl font-black uppercase mb-8">
                                <span>Total</span>
                                <span>R {totalAmount.toLocaleString()}</span>
                            </div>

                            {authReady && !user && (
                                <p className="text-[10px] text-red-600 font-bold mb-4 text-center uppercase tracking-tighter">
                                    Authentication Required to Proceed
                                </p>
                            )}

                            {!authReady && (
                                <div className="flex justify-center mb-4">
                                    <Loader2 className="animate-spin text-gray-300" size={20} />
                                </div>
                            )}

                            <button
                                className="flex w-full items-center justify-center gap-3 border border-black bg-black py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-zikiano-signal hover:text-black disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400"
                                disabled={!authReady || !user || cart.length === 0 || loading}
                                onClick={handleCheckoutClick}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        CHECKOUT
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Delivery form */}
                        {showDelivery && (
                            <div id="delivery-form" className="border border-black p-6 sm:p-8">
                                <h2 className="mb-1 text-lg font-black uppercase tracking-tight">
                                    Delivery Details
                                </h2>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-6">
                                    Pay securely through Paystack after confirming delivery
                                </p>

                                <div className="space-y-3 mb-6">
                                    <input
                                        className={inp}
                                        placeholder="Full Name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                    <input
                                        className={inp}
                                        placeholder="Phone Number (e.g. 0821234567)"
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-5">
                                    {(["address", "postnet"] as const).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setDeliveryMethod(m)}
                                            className={`py-3 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${
                                                deliveryMethod === m
                                                    ? "bg-black text-white border-black"
                                                    : "bg-white text-black border-black hover:bg-gray-50"
                                            }`}
                                        >
                                            {m === "address" ? (
                                                <>
                                                    <MapPin size={13} />
                                                    Home
                                                </>
                                            ) : (
                                                <>
                                                    <Package size={13} />
                                                    PostNet
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {deliveryMethod === "address" && (
                                    <div className="space-y-3 mb-5">
                                        <input
                                            className={inp}
                                            placeholder="Street Address"
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                className={inp}
                                                placeholder="City"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                            />
                                            <input
                                                className={inp}
                                                placeholder="Postal Code"
                                                value={postal}
                                                onChange={(e) => setPostal(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className={inp}
                                            value={province}
                                            onChange={(e) => setProvince(e.target.value)}
                                        >
                                            <option value="">Select Province</option>
                                            {PROVINCES.map((p) => (
                                                <option key={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {deliveryMethod === "postnet" && (
                                    <div className="space-y-3 mb-5">
                                        <select
                                            className={inp}
                                            value={branch.code}
                                            onChange={(e) =>
                                                setBranch(POSTNET_BRANCHES.find((b) => b.code === e.target.value)!)
                                            }
                                        >
                                            {POSTNET_BRANCHES.map((b) => (
                                                <option key={b.code} value={b.code}>
                                                    {b.name} — {b.code}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                                            Parcel addressed to this PostNet branch.
                                        </p>
                                    </div>
                                )}

                                {deliveryError && (
                                    <p className="text-[11px] text-red-600 font-bold uppercase tracking-tight mb-4">
                                        ⚠ {deliveryError}
                                    </p>
                                )}

                                <button
                                    onClick={handlePaystackCheckout}
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-3 border border-black bg-black py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-zikiano-signal hover:text-black disabled:bg-gray-200 disabled:text-gray-400"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                                    Pay with Paystack
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const inp =
    "w-full border border-black px-4 py-3 text-sm uppercase tracking-wider placeholder:text-gray-400 placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-black bg-white";
