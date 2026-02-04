"use server"

import type { StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function updateStaffUserLocation(
  guid: string,
  locationId: string | null
): Promise<StaffUser | null> {
  const existing = await prisma.staffUser.findUnique({
    where: { guid },
  })

  if (!existing || existing.deletedAt) return null

  return prisma.staffUser.update({
    where: { guid },
    data: {
      locationId,
    },
  })
}
