import type { LocationList } from "@/app/api/location/types"
import { prisma } from "@/lib/prisma"

export async function getAllLocations(): Promise<LocationList> {
  const locations = await prisma.location.findMany({
    where: { deletedAt: null },
  })
  return locations as LocationList
}
