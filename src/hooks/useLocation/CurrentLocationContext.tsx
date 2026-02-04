"use client"

import { createContext, useContext } from "react"
import type { LocationDto } from "@/utils/location/types"

export type CurrentLocationContextValue = {
  location: LocationDto | null
  isLoading: boolean
  error: string | null
  refresh: () => void
  setCurrentLocation: (locationId: string | null) => Promise<boolean>
}

export const CurrentLocationContext = createContext<CurrentLocationContextValue | null>(null)

export function useCurrentLocation(): CurrentLocationContextValue {
  const value = useContext(CurrentLocationContext)
  if (!value) {
    throw new Error("useCurrentLocation must be used within CurrentLocationProvider")
  }
  return value
}
