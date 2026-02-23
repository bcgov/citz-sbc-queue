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

  // When changing the primary key `code`, we must locate the row by the previous code.
  // Use previous code if available, otherwise use the provided code.
  const codeToUpdate = prevService.code ?? code

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
    // If a new code was provided (and it's different), include it in the update data
    data: {
      ...(code && code !== codeToUpdate ? { code } : {}),
      ...data,
      ...locationData,
      updatedAt: new Date(),
    },
    include: { locations: true },
  })

  return newService
}
