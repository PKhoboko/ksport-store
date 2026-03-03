import { create } from "zustand";

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clear: () => void;
};

export const useCart = create<CartStore>((set) => ({
    items: [],
    addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),
    removeItem: (id) =>
        set((state) => ({
            items: state.items.filter((i) => i.id !== id),
        })),
    clear: () => set({ items: [] }),
}));
