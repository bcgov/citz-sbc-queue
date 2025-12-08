import { locations } from "../mockData"
import type { Location } from "../types"

export function getLocationByNumber(number: string): Location | undefined {
  return locations.find((l) => l.number === number)
}
