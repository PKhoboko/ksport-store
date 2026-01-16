// lib/mock-data.ts
import { Shoe } from './store';

export const MOCK_SHOES: Shoe[] = [
    {
        id: 1,
        name: "The Clifton Oxford",
        brand: "Barker",
        price: 3850,
        image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop",
        description: "A timeless masterpiece crafted from single-piece calfskin. Ideal for the boardroom in Cape Town or the galleries of Johannesburg.",
        category: "Formal",
        sizes: [7, 8, 9, 10, 11],
        stock: 12
    },
    {
        id: 2,
        name: "Stellenbosch Loafer",
        brand: "G.H. Bass",
        price: 2400,
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1000&auto=format&fit=crop",
        description: "The original penny loafer, reimagined for the Cape Winelands. Unlined leather for breathable, sophisticated summer wear.",
        category: "Casual",
        sizes: [6, 7, 8, 9, 10, 11, 12],
        stock: 25
    },
    {
        id: 3,
        name: "The Sandton Chelsea",
        brand: "R.M. Williams",
        price: 5200,
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1000&auto=format&fit=crop",
        description: "Handcrafted from a single piece of premium yearling leather. Rugged enough for the bush, polished enough for the city.",
        category: "Boots",
        sizes: [8, 9, 10, 11],
        stock: 8
    },
    {
        id: 4,
        name: "Atlantic Seaboard Derby",
        brand: "Church's",
        price: 4950,
        image: "https://images.unsplash.com/photo-1582897085656-c093a67b2def?q=80&w=1000&auto=format&fit=crop",
        description: "Double-stitched welted sole with a polished binder finish. A shoe that commands respect in every room.",
        category: "Formal",
        sizes: [7, 8, 9, 10, 11, 12],
        stock: 5
    },
    {
        id: 5,
        name: "The Karoo Monk Strap",
        brand: "Carmina",
        price: 4100,
        image: "https://images.unsplash.com/photo-1586525203449-4219db9a1706?q=80&w=1000&auto=format&fit=crop",
        description: "Distinctive double-buckle design in rich cognac suede. Perfect for those who lead rather than follow.",
        category: "Formal",
        sizes: [7, 8, 9, 10],
        stock: 14
    },
    {
        id: 7,
        name: "Victoria Wharf Tassel",
        brand: "Loake",
        price: 2950,
        image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=1000&auto=format&fit=crop",
        description: "Premium tassel loafers with a sophisticated profile. Hand-finished in polished burgundy leather.",
        category: "Casual",
        sizes: [6, 7, 8, 9, 10, 11],
        stock: 18
    }
];