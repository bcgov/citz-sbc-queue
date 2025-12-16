"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useState } from "react"
import type { Location } from "@/app/api/location/types"

type LocationContextValue = {
  location: Location | null
  /** Set the current location; pass `null` to clear the selection */
  setLocation: (loc: Location | null) => void
  loadLocationByNumber: (number: string) => Promise<void>
  locations: Location[] | null
  /**
   * Refresh the list of locations from the server and return the array of
   * locations when available, otherwise returns null.
   */
  refreshLocations: () => Promise<Location[] | null>
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null)
  const [locations, setLocations] = useState<Location[] | null>(null)

  const setLocation = useCallback((loc: Location | null) => {
    setLocationState(loc)
  }, [])

  const loadLocationByNumber = useCallback(async (number: string) => {
    try {
      const res = await fetch(`/api/location?number=${encodeURIComponent(number)}`)
      if (!res.ok) return
      const body = await res.json()
      if (body?.success && body?.data) {
        setLocationState(body.data as Location)
      }
    } catch (err) {
      // swallow; keep current location
      // in real app consider tracking error state
      // eslint-disable-next-line no-console
      console.error("loadLocationByNumber error", err)
    }
  }, [])

  const refreshLocations = useCallback(async (): Promise<Location[] | null> => {
    try {
      const res = await fetch(`/api/location`)
      if (!res.ok) return null
      const body = await res.json()
      if (body?.success && Array.isArray(body.data)) {
        const locs = body.data as Location[]
        setLocations(locs)
        return locs
      }
      return null
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("refreshLocations error", err)
      return null
    }
  }, [])

  const value: LocationContextValue = {
    location,
    setLocation,
    loadLocationByNumber,
    locations,
    refreshLocations,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocationContext() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error("useLocationContext must be used within a LocationProvider")
  return ctx
}
