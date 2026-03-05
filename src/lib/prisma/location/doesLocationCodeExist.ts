"use server"

import { prisma } from "@/utils/db/prisma"

/**
 * Function to check if a location code exists.
 * @param code The code of the location
 * @returns Promise resolving to a boolean indicating if the location code exists
 */
export const doesLocationCodeExist = async (code: string): Promise<boolean> => {
  const location = await prisma.location.findUnique({ where: { code } })
  return location !== null
}
