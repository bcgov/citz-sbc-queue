import { locations } from "../mockData"
import type { Location } from "../types"

export function updateLocation(id: string, updates: Partial<Location>): Location | null {
  const idx = locations.findIndex((l) => l.id === id)
  if (idx === -1) return null
  const updated = { ...locations[idx], ...updates }
  // Ensure id doesn't change via updates
  updated.id = locations[idx].id
  locations[idx] = updated
  return updated
}
