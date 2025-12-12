import type { Location } from "@/app/api/location/types"
import { prisma } from "@/lib/prisma"

export async function getAllLocations(): Promise<Location[]> {
  const locations = await prisma.location.findMany({
    where: { deletedAt: null },
  })
  return locations as Location[]
}
