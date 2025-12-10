import { prisma } from "@/lib/prisma"
import type { Location } from "../types"

export async function getAllLocations(): Promise<Location[]> {
  const locations = await prisma.location.findMany({
    where: { deletedAt: null },
  })
  return locations as Location[]
}
