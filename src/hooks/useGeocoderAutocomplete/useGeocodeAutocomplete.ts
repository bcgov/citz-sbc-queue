import { useCallback, useEffect, useRef, useState } from "react"

export type AddressSuggestion = {
  id: string
  label: string
  address: string
  siteName?: string
  civicNumber?: string
  streetName?: string
  locality?: string
  province?: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export type UseGeocodeAutocompleteOptions = {
  minChars?: number
  maxResults?: number
  debounceMs?: number
  authorizationHeader?: string | null
}

export type UseGeocodeAutocompleteReturn = {
  suggestions: AddressSuggestion[]
  loading: boolean
  error: string | null
  search: (address: string) => Promise<void>
  clear: () => void
}

/**
 * Hook for geocoding address autocomplete using BC Address Geocoder API
 * @param options Configuration options for the hook
 * @returns Object with suggestions, loading state, error state, search function
 * @example
 * const { suggestions, loading, error, search } = useGeocodeAutocomplete({
 *   minChars: 2,
 *   debounceMs: 300,
 *   authorizationHeader: "Bearer ..."
 * })
 *
 * const handleAddressChange = async (value: string) => {
 *   await search(value)
 * }
 */
export const useGeocodeAutocomplete = (
  options: UseGeocodeAutocompleteOptions = {}
): UseGeocodeAutocompleteReturn => {
  const { minChars = 2, debounceMs = 300, authorizationHeader } = options
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const performSearch = useCallback(
    async (address: string) => {
      setError(null)

      if (!address || address.length < minChars) {
        setSuggestions([])
        return
      }

      // Cancel previous request if still in flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setLoading(true)

      try {
        const headers: Record<string, string> = {}
        if (authorizationHeader) {
          headers.Authorization = authorizationHeader
        }

        const response = await fetch(
          `/api/protected/geocoder?address=${encodeURIComponent(address)}`,
          {
            signal: abortControllerRef.current.signal,
            headers,
          }
        )

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to fetch suggestions")
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (err) {
        // Don't show error if request was aborted
        if (err instanceof Error && err.name !== "AbortError") {
          const errorMessage = err instanceof Error ? err.message : "An error occurred"
          setError(errorMessage)
          setSuggestions([])
        }
      } finally {
        setLoading(false)
      }
    },
    [minChars, authorizationHeader]
  )

  const search = useCallback(
    async (address: string) => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        performSearch(address)
      }, debounceMs)
    },
    [performSearch, debounceMs]
  )

  const clear = useCallback(() => {
    setSuggestions([])
    setError(null)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    suggestions,
    loading,
    error,
    search,
    clear,
  }
}
