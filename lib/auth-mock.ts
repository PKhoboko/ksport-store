import { create } from 'zustand';

interface AuthState {
    user: { email: string; name: string } | null;
    isAdmin: boolean;
    login: (email: string) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isAdmin: false,
    login: (email) => set({
        user: { email, name: email.split('@')[0] },
        isAdmin: email === 'admin@elegance.co.za' // Set your admin email here
    }),
    logout: () => set({ user: null, isAdmin: false }),
}));