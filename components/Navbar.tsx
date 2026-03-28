import { create } from "zustand";

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

type CartStore = {
    items: CartItem[];
    notification: string | null;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clear: () => void;
    setNotification: (message: string | null) => void;
};

export const useCart = create<CartStore>((set) => ({
    items: [],
    notification: null,

    addItem: (item) =>
        set((state) => ({
            items: [...state.items, item],
            // Optional: trigger notification automatically on add
            notification: `Added ${item.name} to cart`,
        })),

    removeItem: (id) =>
        set((state) => ({
            items: state.items.filter((i) => i.id !== id),
        })),

    clear: () => set({ items: [] }),

    setNotification: (message) => set({ notification: message }),
}));