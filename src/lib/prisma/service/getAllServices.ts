"use server"

import type { Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to retrieve all services.
 * @returns Promise resolving to an array of Service objects
 */
export const getAllServices = async (): Promise<Service[]> => {
  const services = await prisma.service.findMany()
  return services
}
