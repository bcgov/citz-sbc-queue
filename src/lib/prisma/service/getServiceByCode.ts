"use server"

import type { Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to retrieve a service by its code.
 * @param code The code of the service
 * @returns Promise resolving to a Service object or null if not found
 */
export const getServiceByCode = async (code: string): Promise<Service | null> => {
  const service = await prisma.service.findUnique({ where: { code } })
  return service
}
