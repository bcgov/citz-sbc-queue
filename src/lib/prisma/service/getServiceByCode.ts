"use server"

import { prisma } from "@/utils/db/prisma"
import type { ServiceWithRelations } from "./types"

/**
 * Function to retrieve a service by its code.
 * @param code The code of the service
 * @returns Promise resolving to a Service object with its relations or null if not found
 */
export const getServiceByCode = async (code: string): Promise<ServiceWithRelations | null> => {
  const service = await prisma.service.findUnique({ where: { code }, include: { locations: true } })
  return service
}
