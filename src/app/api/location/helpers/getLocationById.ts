import { locations } from "../mockData"
import type { Location } from "../types"

export function getLocationById(id: string): Location | undefined {
  return locations.find((l) => l.id === id)
}
