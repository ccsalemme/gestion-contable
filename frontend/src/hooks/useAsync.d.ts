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
export declare function useAsync<T>(asyncFunction: () => Promise<T>, immediate?: boolean): {
    execute: () => Promise<T | null>;
    status: "idle" | "pending" | "success" | "error";
    data: T | null;
    error: Error | null;
};
//# sourceMappingURL=useAsync.d.ts.map