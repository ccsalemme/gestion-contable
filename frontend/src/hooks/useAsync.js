import { useState, useCallback, useEffect } from 'react';
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
export function useAsync(asyncFunction, immediate = true) {
    const [state, setState] = useState({
        status: 'idle',
        data: null,
        error: null,
    });
    const execute = useCallback(async () => {
        setState({ status: 'pending', data: null, error: null });
        try {
            const response = await asyncFunction();
            setState({ status: 'success', data: response, error: null });
            return response;
        }
        catch (error) {
            setState({
                status: 'error',
                data: null,
                error: error instanceof Error ? error : new Error(String(error)),
            });
            return null;
        }
    }, [asyncFunction]);
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);
    return { ...state, execute };
}
//# sourceMappingURL=useAsync.js.map