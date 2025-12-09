import { locations } from "../mockData"
import type { Location } from "../types"

export function createLocation(location: Location): Location {
  // Ensure unique id
  const exists = locations.find((l) => l.id === location.id)
  if (exists) {
    throw new Error("Location with that id already exists")
  }
  locations.push(location)
  return location
}
