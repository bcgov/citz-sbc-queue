import { locations } from "../mockData"
import type { Location } from "../types"

export function updateLocation(number: string, updates: Partial<Location>): Location | null {
  const idx = locations.findIndex((l) => l.number === number)
  if (idx === -1) return null
  const updated = { ...locations[idx], ...updates }
  // Ensure number doesn't change via updates
  updated.number = locations[idx].number
  locations[idx] = updated
  return updated
}
