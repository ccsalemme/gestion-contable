import { useState, useCallback } from 'react'

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])

  return {
    isLoading,
    startLoading,
    stopLoading,
  }
}

export function useError(initialError: string | null = null) {
  const [error, setError] = useState<string | null>(initialError)

  const clearError = useCallback(() => setError(null), [])

  return {
    error,
    setError,
    clearError,
  }
}
