import type { Location } from "@/app/api/location/types"
import { prisma } from "@/lib/prisma"

export async function getLocationById(id: string): Promise<Location | null> {
  const location = await prisma.location.findUnique({
    where: { id },
  })
  if (location?.deletedAt) return null
  return location as Location | null
}
