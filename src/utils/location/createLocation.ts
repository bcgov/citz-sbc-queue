import type { Location, Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function createLocation(location: Prisma.LocationCreateInput): Promise<Location> {
  const created = await prisma.location.create({
    data: location,
  })
  return created
}
