import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Shoe {
    id: number; name: string; brand: string; price: number;
    image_url: string; description: string; stock: number;
}

// YOUR ACTUAL STOCK - Edit this to go live tomorrow
export const MOCK_INVENTORY: Shoe[] = [
    {
        id: 1,
        name: "Oxford Elegance",
        brand: "Barker",
        price: 3499,
        image_url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800",
        description: "Premium handcrafted leather.",
        stock: 5
    },
    {
        id: 2,
        name: "Derby Classic",
        brand: "Loake",
        price: 2899,
        image_url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800",
        description: "Goodyear welted construction.",
        stock: 10
    }
];

interface CartStore {
    cart: Shoe[];
    addToCart: (shoe: Shoe) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
}

export const useCart = create<CartStore>()(
    persist(
        (set) => ({
            cart: [],
            addToCart: (shoe) => set((state) => ({ cart: [...state.cart, shoe] })),
            removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((s) => s.id !== id) })),
            clearCart: () => set({ cart: [] }),
        }),
        { name: 'cart-storage' }
    )
);