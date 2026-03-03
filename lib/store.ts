import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Shoe {
    id: number;
    name: string;
    brand: string;
    price: number;
    image_url: string;
    quantity?: number;
    stock: number;
    description: string;
    category: string;
    sizes: number[];
}

interface GlobalStore {
    cart: Shoe[];
    user: { email: string; name: string } | null;
    toast: string | null;

    // Actions
    addToCart: (shoe: Shoe) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    login: (email: string) => void;
    logout: () => void;
    setToast: (msg: string | null) => void;
}

export const useStore = create<GlobalStore>()(
    persist(
        (set) => ({
            cart: [],
            user: null,
            toast: null,

            addToCart: (shoe) => set((state) => {
                const exists = state.cart.find((item) => item.id === shoe.id);

                if (exists) {
                    return { toast: `${shoe.name.toUpperCase()} IS ALREADY IN BAG` };
                }

                return {
                    cart: [...state.cart, shoe],
                    toast: `ADDED ${shoe.name.toUpperCase()} TO BAG`
                };
            }),

            removeFromCart: (id) => set((state) => ({
                cart: state.cart.filter((item) => item.id !== id),
                toast: "REMOVED FROM BAG"
            })),

            clearCart: () => set({ cart: [], toast: null }),

            login: (email) => set({
                user: { email, name: email.split('@')[0] },
                toast: "WELCOME"
            }),

            logout: () => set({ user: null, cart: [], toast: "SIGNED OUT" }),

            setToast: (msg) => set({ toast: msg }),
        }),
        {
            name: 'zikiano-v1',
            // FIX: This prevents "window is not defined" during Next.js build
            storage: createJSONStorage(() => {
                if (typeof window !== 'undefined') {
                    return window.localStorage;
                } else {
                    // Return a dummy storage for the server-side build phase
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
            }),
        }
    )
);