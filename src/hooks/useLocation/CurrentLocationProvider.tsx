"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  CurrentLocationResponse,
  LocationDto,
  UpdateCurrentLocationRequest,
  UpdateCurrentLocationResponse,
} from "@/utils/location/types"
import { CurrentLocationContext } from "./CurrentLocationContext"

export type CurrentLocationProviderProps = {
  children: React.ReactNode
}

export default function CurrentLocationProvider({ children }: CurrentLocationProviderProps) {
  const [location, setLocation] = useState<LocationDto | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const setCurrentLocation = useCallback(
    async (locationId: string | null): Promise<boolean> => {
      setError(null)

      try {
        const body: UpdateCurrentLocationRequest = { locationId }
        const response = await fetch("/api/protected/current-location", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })

        if (response.status === 401) {
          setLocation(null)
          setError(null)
          return false
        }

        const payload = (await response.json()) as UpdateCurrentLocationResponse

        if (!response.ok || !payload.success) {
          setError(payload.success ? "Failed to update current location" : payload.error)
          return false
        }

        refresh()
        return true
      } catch (caught) {
        console.error("Failed to update current location:", caught)
        setError("Failed to update current location")
        return false
      }
    },
    [refresh]
  )

  useEffect(() => {
    const abortController = new AbortController()

    async function run() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/protected/current-location?refresh=${refreshKey}`, {
          method: "GET",
          signal: abortController.signal,
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          setLocation(null)
          setError(null)
          return
        }

        const body = (await response.json()) as CurrentLocationResponse

        if (!response.ok || !body.success) {
          setLocation(null)
          setError(body.success ? "Failed to load current location" : body.error)
          return
        }

        setLocation(body.data.location)
      } catch (caught) {
        if (abortController.signal.aborted) return
        console.error("Failed to fetch current location:", caught)
        setLocation(null)
        setError("Failed to load current location")
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false)
      }
    }

    void run()

    return () => {
      abortController.abort()
    }
  }, [refreshKey])

  const value = useMemo(
    () => ({
      location,
      isLoading,
      error,
      refresh,
      setCurrentLocation,
    }),
    [location, isLoading, error, refresh, setCurrentLocation]
  )

  return <CurrentLocationContext.Provider value={value}>{children}</CurrentLocationContext.Provider>
}
