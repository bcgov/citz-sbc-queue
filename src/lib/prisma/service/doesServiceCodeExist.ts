"use server"

import { prisma } from "@/utils/db/prisma"

/**
 * Function to check if a service code exists.
 * @param code The code of the service
 * @returns Promise resolving to a boolean indicating if the service code exists
 */
export const doesServiceCodeExist = async (code: string): Promise<boolean> => {
  const service = await prisma.service.findUnique({ where: { code } })
  return service !== null
}
