import { User } from '@/types';
interface AuthStore {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthStore>>;
export {};
//# sourceMappingURL=auth.d.ts.map