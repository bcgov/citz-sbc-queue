import { prisma } from "@/lib/prisma"
import type { Location } from "../types"

export async function updateLocation(
  id: string,
  updates: Partial<Location>
): Promise<Location | null> {
  const existing = await prisma.location.findUnique({
    where: { id },
  })
  if (!existing || existing.deletedAt) return null

  const updated = await prisma.location.update({
    where: { id },
    data: updates,
  })
  return updated as Location
}
