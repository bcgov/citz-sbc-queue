"use server"

import type { Location, Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function createLocation(location: Prisma.LocationCreateInput): Promise<Location> {
  return prisma.location.create({
    data: location,
  })
}
