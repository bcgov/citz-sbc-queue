import { locations } from "../mockData"

export function deleteLocation(id: string): boolean {
  const idx = locations.findIndex((l) => l.id === id)
  if (idx === -1) return false
  locations.splice(idx, 1)
  return true
}
