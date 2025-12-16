"use client"

import { useCallback, useEffect, useState } from "react"
import type { CreateLocation, Location, UpdateLocation } from "@/app/api/location/types"
import { useAuth } from "@/hooks/useAuth/useAuth"
import { useLocationContext } from "./LocationProvider"

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
  const { hasRole } = useAuth()

  const canCreate = hasRole("Administrator")
  const canDelete = hasRole("Administrator")
  const canUpdate = hasRole("Administrator") || hasRole("SDM")

  // local loading state for convenience in components
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // On mount, refresh the list of locations and set the current location to
    // the first available location. Do not set a local default — if the server
    // returns no locations, leave `currentLocation` null so the UI can handle
    // the 'no data' case explicitly.
    let cancelled = false

    const init = async () => {
      const locs = await ctx.refreshLocations()
      if (cancelled) return

      // Only set initial location if none is already set.
      if (!ctx.location && locs && locs.length > 0) {
        ctx.setLocation(locs[0])
      }
    }

    void init()
    return () => {
      cancelled = true
    }
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const createLocation = useCallback(
    async (payload: CreateLocation) => {
      if (!canCreate) throw new Error("Unauthorized")
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.error || "Failed to create")
        await ctx.refreshLocations()
        return body.data as Location
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
        const res = await fetch(`/api/location?id=${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.error || "Failed to update")
        await ctx.refreshLocations()
        return body.data as Location
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
        const res = await fetch(`/api/location?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.error || "Failed to delete")

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

  const setCurrentLocation = useCallback(
    (loc: Location) => {
      ctx.setLocation(loc)
    },
    [ctx]
  )

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
