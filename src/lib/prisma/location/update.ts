"use server"

import type { Location, Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function updateLocation(
  id: string,
  updates: Prisma.LocationUpdateInput
): Promise<Location | null> {
  const existing = await prisma.location.findUnique({
    where: { id },
  })

  if (!existing || existing.deletedAt) return null

  return prisma.location.update({
    where: { id },
    data: updates,
  })
}
