import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('authToken'),
    isLoading: false,
    error: null,
    setUser: (user) => set({ user }),
    setToken: (token) => {
        localStorage.setItem('authToken', token);
        set({ token });
    },
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, token: null, error: null });
    },
}));
//# sourceMappingURL=auth.js.map