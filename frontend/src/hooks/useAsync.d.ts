export declare function useLoading(initialState?: boolean): {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
};
export declare function useError(initialError?: string | null): {
    error: string | null;
    setError: import("react").Dispatch<import("react").SetStateAction<string | null>>;
    clearError: () => void;
};
//# sourceMappingURL=useAsync.d.ts.map