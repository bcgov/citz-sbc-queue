"use server"

import { prisma } from "@/utils/db/prisma"
import type { ServiceWithRelations } from "./types"

/**
 * Function to retrieve all services.
 * @returns Promise resolving to an array of Service objects with their relations
 */
export const getAllServices = async (): Promise<ServiceWithRelations[]> => {
  const services = await prisma.service.findMany({ include: { locations: true } })
  return services
}
