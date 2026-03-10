"use server"

import { prisma } from "@/utils/db/prisma"
import type { LocationWithRelations } from "./types"

/**
 * Function to retrieve a location and their relations by their code.
 * @param code The code of the location
 * @returns Promise resolving to a LocationWithRelations object or null if not found
 */
export const getLocationByCode = async (code: string): Promise<LocationWithRelations | null> => {
  const location = await prisma.location.findUnique({
    where: { code },
    include: { services: true, counters: true, staffUsers: true },
  })
  return location
}
