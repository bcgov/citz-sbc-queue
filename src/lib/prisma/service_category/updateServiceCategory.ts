"use server"

import { prisma } from "@/utils/db/prisma"
import type { ServiceCategoryWithRelations } from "./types"

/**
 * Function to update a service category in the database.
 * @param serviceCategory Data to update the service category with
 * @returns Promise resolving to the updated ServiceCategoryWithRelations object or null if not found
 */
export const updateServiceCategory = async (
  serviceCategory: Partial<ServiceCategoryWithRelations>
): Promise<ServiceCategoryWithRelations | null> => {
  const { id, services, ...data } = serviceCategory
  if (!id) return null

  // Update services if provided, otherwise keep existing relations
  const serviceData = services
    ? {
        services: {
          set: services.map((service) => ({ code: service.code })),
        },
      }
    : {}

  const newServiceCategory = await prisma.serviceCategory.update({
    where: { id },
    data: {
      ...data,
      ...serviceData,
      updatedAt: new Date(),
    },
    include: { services: true },
  })

  return newServiceCategory
}
