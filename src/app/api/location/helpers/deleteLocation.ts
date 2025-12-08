import { locations } from "../mockData"

export function deleteLocation(number: string): boolean {
  const idx = locations.findIndex((l) => l.number === number)
  if (idx === -1) return false
  locations.splice(idx, 1)
  return true
}
