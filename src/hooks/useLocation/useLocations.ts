"use client"

import { useCallback, useEffect, useState } from "react"
import type { GetAllLocationsResponse, LocationDto } from "@/utils/location/types"

export type UseLocationsReturn = {
  locations: LocationDto[] | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<LocationDto[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchKey, setRefetchKey] = useState<number>(0)

  const refetch = useCallback(() => {
    setRefetchKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    async function run() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/protected/locations?refresh=${refetchKey}`, {
          method: "GET",
          signal: abortController.signal,
          headers: {
            "Content-Type": "application/json",
          },
        })

        const body = (await response.json()) as GetAllLocationsResponse

        if (!response.ok || !body.success) {
          setLocations(null)
          setError(body.success ? "Failed to load locations" : body.error)
          return
        }

        setLocations(body.data.locations)
      } catch (caught) {
        if (abortController.signal.aborted) return
        console.error("Failed to fetch locations:", caught)
        setLocations(null)
        setError("Failed to load locations")
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false)
      }
    }

    void run()

    return () => {
      abortController.abort()
    }
  }, [refetchKey])

  return {
    locations,
    isLoading,
    error,
    refetch,
  }
}

export default useLocations
