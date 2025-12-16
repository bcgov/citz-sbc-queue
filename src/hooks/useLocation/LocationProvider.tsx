"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useState } from "react"
import type { Location } from "@/app/api/location/types"

type LocationContextValue = {
  location: Location | null
  setLocation: (loc: Location) => void
  loadLocationByNumber: (number: string) => Promise<void>
  locations: Location[] | null
  refreshLocations: () => Promise<void>
}

export const DEFAULT_TEST_OFFICE: Location = {
  id: "test-location",
  name: "Test Office",
  legacyOfficeNumber: 999,
  timezone: "America/Vancouver",
  streetAddress: "1 Test Lane, Testville, BC T0T 0T0",
  mailAddress: "",
  phoneNumber: "250-555-0999",
  latitude: 49.0,
  longitude: -123.0,
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(DEFAULT_TEST_OFFICE)
  const [locations, setLocations] = useState<Location[] | null>(null)

  const setLocation = useCallback((loc: Location) => {
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

  const refreshLocations = useCallback(async () => {
    try {
      const res = await fetch(`/api/location`)
      if (!res.ok) return
      const body = await res.json()
      if (body?.success && Array.isArray(body.data)) {
        setLocations(body.data as Location[])
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("refreshLocations error", err)
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
