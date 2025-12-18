import type { CreateLocation, Location, UpdateLocation } from "@/app/api/location/types"

export async function apiRefreshLocations(): Promise<Location[] | null> {
  const res = await fetch(`/api/location`)
  if (!res.ok) return null
  const body = await res.json()
  if (body?.success && Array.isArray(body.data)) return body.data as Location[]
  return null
}

export async function apiLoadLocationByNumber(number: string): Promise<Location | null> {
  const res = await fetch(`/api/location?number=${encodeURIComponent(number)}`)
  if (!res.ok) return null
  const body = await res.json()
  if (body?.success && body?.data) return body.data as Location
  return null
}

export async function apiCreateLocation(payload: CreateLocation): Promise<Location> {
  const res = await fetch(`/api/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.error || "Failed to create")
  return body.data as Location
}

export async function apiUpdateLocation(id: string, updates: UpdateLocation): Promise<Location> {
  const res = await fetch(`/api/location?id=${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.error || "Failed to update")
  return body.data as Location
}

export async function apiDeleteLocation(id: string): Promise<boolean> {
  const res = await fetch(`/api/location?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.error || "Failed to delete")
  return true
}
