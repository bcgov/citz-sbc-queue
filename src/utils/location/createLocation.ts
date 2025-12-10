import type { Location } from "@/app/api/location/types"
import { prisma } from "@/lib/prisma"

export async function createLocation(location: Location): Promise<Location> {
  const created = await prisma.location.create({
    data: location,
  })
  return created as Location
}
