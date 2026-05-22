import { useState, useCallback } from 'react';
export function useLoading(initialState = false) {
    const [isLoading, setIsLoading] = useState(initialState);
    const startLoading = useCallback(() => setIsLoading(true), []);
    const stopLoading = useCallback(() => setIsLoading(false), []);
    return {
        isLoading,
        startLoading,
        stopLoading,
    };
}
export function useError(initialError = null) {
    const [error, setError] = useState(initialError);
    const clearError = useCallback(() => setError(null), []);
    return {
        error,
        setError,
        clearError,
    };
}
//# sourceMappingURL=useAsync.js.map