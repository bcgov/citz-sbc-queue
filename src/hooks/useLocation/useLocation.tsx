"use client"

import { useCallback, useEffect, useState } from "react"
import type { CreateLocation, Location, UpdateLocation } from "@/app/api/location/types"
import * as api from "./api"
import { useLocationContext } from "./LocationProvider"
import { useLocationPermissions } from "./permissions"

/**
 * Hook that provides location data and CRUD operations.
 *
 * Behavior and notes:
 * - On mount, refreshes locations and, if there are locations, sets the
 *   `currentLocation` to the first item returned by the server. It does not
 *   use any local fallback — if there are no locations, the current location
 *   remains null.
 * - Exposes granular permission flags:
 *   - `canCreate` (Administrator)
 *   - `canUpdate` (Administrator or SDM)
 *   - `canDelete` (Administrator)
 * - All CRUD operations are performed via the `/api/location` route and return
 *   server responses; the hook refreshes the locations list after mutations.
 * - Permission checks are performed client-side for UI convenience; the server
 *   must still enforce authorization for real security.
 *
 * Returns an object:
 * {
 *   locations: Location[] | null,
 *   currentLocation: Location | null,
 *   setCurrentLocation: (loc: Location) => void,
 *   loadLocationByNumber: (number: string) => Promise<void>,
 *   refresh: () => Promise<void>,
 *   createLocation: (payload: CreateLocation) => Promise<Location>,
 *   updateLocation: (id: string, updates: UpdateLocation) => Promise<Location>,
 *   deleteLocation: (id: string) => Promise<boolean>,
 *   canCreate: boolean,
 *   canUpdate: boolean,
 *   canDelete: boolean,
 *   loading: boolean,
 *   error: string | null,
 * }
 */
export function useLocation() {
  const ctx = useLocationContext()

  const { canCreate, canUpdate, canDelete } = useLocationPermissions()

  // local loading state for convenience in components
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // NOTE: The initial refresh and default-selection is handled by
  // `LocationProvider` so the hook stays focused on exposing operations and
  // permissions. This keeps the hook very small and easy to test.
  // (No effect here.)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await ctx.refreshLocations()
    } catch (err: any) {
      setError(String(err?.message ?? err))
    } finally {
      setLoading(false)
    }
  }, [ctx])

  // Thin wrappers that delegate to the API helpers and keep state handling in
  // the hook concise. Errors thrown by the API helpers are propagated.

  const createLocation = useCallback(
    async (payload: CreateLocation) => {
      if (!canCreate) throw new Error("Unauthorized")
      setLoading(true)
      setError(null)
      try {
        const created = await api.apiCreateLocation(payload)
        await ctx.refreshLocations()
        return created
      } finally {
        setLoading(false)
      }
    },
    [canCreate, ctx]
  )

  const updateLocation = useCallback(
    async (id: string, updates: UpdateLocation) => {
      if (!canUpdate) throw new Error("Unauthorized")
      setLoading(true)
      setError(null)
      try {
        const updated = await api.apiUpdateLocation(id, updates)
        await ctx.refreshLocations()
        return updated
      } finally {
        setLoading(false)
      }
    },
    [canUpdate, ctx]
  )

  const deleteLocation = useCallback(
    async (id: string) => {
      if (!canDelete) throw new Error("Unauthorized")
      setLoading(true)
      setError(null)
      try {
        await api.apiDeleteLocation(id)

        // if we deleted the current location, try to reset to the first
        // available location from the server; if none exist leave it null.
        if (ctx.location?.id === id) {
          const locs = await ctx.refreshLocations()
          if (locs && locs.length > 0) {
            ctx.setLocation(locs[0])
          } else {
            ctx.setLocation(null)
          }
        } else {
          await ctx.refreshLocations()
        }
        return true
      } finally {
        setLoading(false)
      }
    },
    [canDelete, ctx]
  )

  const setCurrentLocation = useCallback((loc: Location | null) => ctx.setLocation(loc), [ctx])

  return {
    locations: ctx.locations,
    currentLocation: ctx.location,
    setCurrentLocation,
    loadLocationByNumber: ctx.loadLocationByNumber,
    refresh,
    createLocation,
    updateLocation,
    deleteLocation,
    canCreate,
    canUpdate,
    canDelete,
    loading,
    error,
  }
}

export default useLocation
