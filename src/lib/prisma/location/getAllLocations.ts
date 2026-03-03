"use server"

import { prisma } from "@/utils/db/prisma"
import type { LocationWithRelations } from "./types"

/**
 * Function to retrieve all locations.
 * @returns Promise resolving to an array of Location objects with their relations
 */
export const getAllLocations = async (): Promise<LocationWithRelations[]> => {
  const locations = (
    await prisma.location.findMany({
      include: { services: true, counters: true, staffUsers: true },
    })
  ).sort(
    (a, b) => a.name.localeCompare(b.name) // Sort by name in alphabetical order
  )
  return locations
}
