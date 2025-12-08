import { locations } from "../mockData"
import type { Location } from "../types"

export function createLocation(location: Location): Location {
  // Ensure unique number
  const exists = locations.find((l) => l.number === location.number)
  if (exists) {
    throw new Error("Location with that number already exists")
  }
  locations.push(location)
  return location
}
