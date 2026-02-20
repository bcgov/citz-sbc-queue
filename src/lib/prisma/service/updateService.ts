"use server"

import { prisma } from "@/utils/db/prisma"
import type { ServiceWithRelations } from "./types"

/**
 * Function to update a service in the database.
 * @param service Data to update the service with
 * @param prevService Previous data of the service
 * @returns Promise resolving to the updated ServiceWithRelations object or null if not found
 */
export const updateService = async (
  service: Partial<ServiceWithRelations>,
  prevService: Partial<ServiceWithRelations>
): Promise<ServiceWithRelations | null> => {
  const { code, locations, ...data } = service
  if (!code && !prevService.code) return null

  // Use provided code or fall back to previous service's code
  const codeToUpdate = code || prevService.code

  // Update locations if provided, otherwise keep existing relations
  const locationData = locations
    ? {
        locations: {
          set: locations.map((loc) => ({ id: loc.id })),
        },
      }
    : {}

  const newService = await prisma.service.update({
    where: { code: codeToUpdate },
    data: { ...data, ...locationData, updatedAt: new Date() },
    include: { locations: true },
  })

  return newService
}
