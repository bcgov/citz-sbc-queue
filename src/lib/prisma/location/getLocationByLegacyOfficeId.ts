"use server"

import type { Location } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Find a Location by its legacy office number (`legacyOfficeNumber`).
 * @param officeId legacy office number from the CSR table
 * @returns the Location or null
 */
export const getLocationByLegacyOfficeId = async (officeId: number): Promise<Location | null> => {
  const location = await prisma.location.findUnique({
    where: { legacyOfficeNumber: officeId },
  })
  return location
}
