"use server"

import type { Location } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function getAllLocations(): Promise<Location[]> {
  return prisma.location.findMany({
    where: { deletedAt: null },
  })
}
