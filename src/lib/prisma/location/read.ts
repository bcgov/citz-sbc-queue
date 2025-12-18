"use server"

import type { Location } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function getAllLocations(): Promise<Location[]> {
  return prisma.location.findMany({
    where: { deletedAt: null },
  })
}

export async function getLocationById(id: string): Promise<Location | null> {
  const location = await prisma.location.findUnique({
    where: { id },
  })

  if (location?.deletedAt) return null
  return location
}
