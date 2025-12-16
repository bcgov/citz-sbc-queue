"use client"

import { useCallback, useEffect, useState } from "react"
import type { CreateLocation, Location, UpdateLocation } from "@/app/api/location/types"
import { useAuth } from "@/hooks/useAuth/useAuth"
import { DEFAULT_TEST_OFFICE, useLocationContext } from "./LocationProvider"

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
    // ensure there is always a current location set (default to test office)
    if (!ctx.location) {
      ctx.setLocation(DEFAULT_TEST_OFFICE)
    }
    // initial load of all locations
    void ctx.refreshLocations()
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

        // if we deleted the current location, reset to default test office
        if (ctx.location?.id === id) ctx.setLocation(DEFAULT_TEST_OFFICE)
        await ctx.refreshLocations()
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
