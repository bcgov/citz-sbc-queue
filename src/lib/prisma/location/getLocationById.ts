"use server"

import { prisma } from "@/utils/db/prisma"
import type { LocationWithRelations } from "./types"

/**
 * Function to retrieve a location and their relations by their identifier.
 * @param id The identifier of the location
 * @returns Promise resolving to a LocationWithRelations object or null if not found
 */
export const getLocationById = async (id: string): Promise<LocationWithRelations | null> => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: { services: true, counters: true, staffUsers: true },
  })
  return location
}
