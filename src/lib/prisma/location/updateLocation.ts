"use server"

import { prisma } from "@/utils/db/prisma"
import type { LocationWithRelations } from "./types"

/**
 * Function to update a location in the database.
 * @param location Data to update the location with
 * @param prevLocation Previous data of the location
 * @returns Promise resolving to the updated LocationWithRelations object or null if not found
 */
export const updateLocation = async (
  location: Partial<LocationWithRelations>,
  prevLocation: Partial<LocationWithRelations>
): Promise<LocationWithRelations | null> => {
  const { code, services, counters, staffUsers, ...data } = location
  if (!code && !prevLocation.code) return null

  // When changing the primary key `code`, we must locate the row by the previous code.
  // Use previous code if available, otherwise use the provided code.
  const codeToUpdate = prevLocation.code ?? code

  // Update services if provided, otherwise keep existing relations
  const serviceData = services
    ? {
        services: {
          set: services.map((service) => ({ code: service.code })),
        },
      }
    : {}

  const counterData = counters
    ? {
        counters: {
          set: counters.map((counter) => ({ id: counter.id })),
        },
      }
    : {}

  const staffUserData = staffUsers
    ? {
        staffUsers: {
          set: staffUsers.map((user) => ({ guid: user.guid })),
        },
      }
    : {}

  const newLocation = await prisma.location.update({
    where: { code: codeToUpdate },
    data: {
      ...(code && code !== codeToUpdate ? { code } : {}),
      ...data,
      ...serviceData,
      ...counterData,
      ...staffUserData,
      updatedAt: new Date(),
    },
    include: { services: true, counters: true, staffUsers: true },
  })

  return newLocation
}
