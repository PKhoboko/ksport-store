"use client";

import { useCart } from "@/lib/cart";
import { useEffect } from "react";

export function CartNotification() {
    // Select specific pieces of state to prevent unnecessary re-renders
    const notification = useCart((state) => state.notification);
    const setNotification = useCart((state) => state.setNotification);

    useEffect(() => {
        if (notification) {
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    if (!notification) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-black text-white px-6 py-3 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-3">
                {/* Status Indicator */}
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

                {/* Message */}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {notification}
                </span>
            </div>
        </div>
    );
}