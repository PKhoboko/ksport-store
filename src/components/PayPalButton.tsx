"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
    amount: number; // in ZAR
    onSuccess: (details: any) => void;
    onError?: (error: any) => void;
}

export default function PayPalButton({
                                         amount,
                                         onSuccess,
                                         onError,
                                     }: PayPalButtonProps) {
    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "ZAR",
        intent: "capture",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
                style={{ layout: "vertical", shape: "rect", color: "black" }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "ZAR",
                                    value: amount.toFixed(2),
                                },
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
        </PayPalScriptProvider>
    );
}