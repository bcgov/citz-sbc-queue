import { prisma } from "@/lib/prisma"
import type { Location } from "../types"

export async function getLocationById(id: string): Promise<Location | null> {
  const location = await prisma.location.findUnique({
    where: { id },
  })
  if (location?.deletedAt) return null
  return location as Location | null
}
