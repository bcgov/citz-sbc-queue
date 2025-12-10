import { prisma } from "@/lib/prisma"
import type { Location } from "../types"

export async function createLocation(location: Location): Promise<Location> {
  const created = await prisma.location.create({
    data: location,
  })
  return created as Location
}
