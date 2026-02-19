"use server"

import type { Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to update a service in the database.
 * @param service Data to update the service with
 * @param prevService Previous data of the service
 * @returns Promise resolving to the updated Service object or null if not found
 */
export const updateService = async (
  service: Partial<Service>,
  prevService: Partial<Service>
): Promise<Service | null> => {
  const { code, ...data } = service
  if (!code && !prevService.code) return null

  // Use provided code or fall back to previous service's code
  const codeToUpdate = code || prevService.code

  const newService = await prisma.service.update({
    where: { code: codeToUpdate },
    data: { ...data, updatedAt: new Date() },
  })

  return newService
}
