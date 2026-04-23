"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
    amountZAR: number; // amount in South African Rand
    onSuccess: (details: any) => void;
    onError?: (error: any) => void;
}

// You can fetch live rates or use a fixed conversion rate
const ZAR_TO_USD_RATE = 0.053; // Example: 1 ZAR ≈ 0.053 USD (update regularly)

export default function PayPalButton({ amountZAR, onSuccess, onError }: PayPalButtonProps) {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
        return (
            <div className="p-4 bg-red-50 border border-red-300 text-red-700 text-sm">
                ⚠️ PayPal Client ID is missing.
            </div>
        );
    }
//Change
    const amountUSD = (2 * ZAR_TO_USD_RATE).toFixed(2);

    const initialOptions = {
        clientId,
        currency: "USD",
        intent: "capture",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <div className="space-y-2">
                <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", color: "black" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: "USD",
                                        value: amountUSD,
                                    },
                                    description: `Order total: R ${amountZAR.toFixed(2)}`,
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        const details = await actions.order?.capture();
                        onSuccess(details);
                    }}
                    onError={(err) => {
                        console.error("PayPal error:", err);
                        onError?.(err);
                    }}
                />
                <p className="text-xs text-gray-500 text-center">
                    You will be charged approximately ${amountUSD} USD (R {amountZAR.toFixed(2)})
                </p>
            </div>
        </PayPalScriptProvider>
    );
}