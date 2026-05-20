"use server"

import { prisma } from "@/utils/db/prisma"
import type { CounterWithRelations } from "./types"

const DEFAULT_COUNTER_NAME = "Counter"

/**
 * Function to update a counter in the database.
 *
 * When locations are removed from the counter, any staff user assigned to this
 * counter whose location code is one of the removed locations will be moved to
 * the default "Counter" counter (or have their counterId set to null if the
 * default counter cannot be found).
 *
 * @param counter Data to update the counter with
 * @param prevCounter Previous data of the counter (should include locations)
 * @returns Promise resolving to the updated CounterWithRelations object or null if not found
 */
export const updateCounter = async (
  counter: Partial<CounterWithRelations>,
  prevCounter: Partial<CounterWithRelations>
): Promise<CounterWithRelations | null> => {
  const { locations, staffUsers, ...data } = counter
  const id = counter.id ?? prevCounter.id
  if (!id) return null

  // Determine which locations are being removed so displaced staff can be reassigned
  if (locations && prevCounter.locations) {
    const newLocationCodes = new Set(locations.map((l) => l.code))
    const removedLocationCodes = prevCounter.locations
      .filter((l) => !newLocationCodes.has(l.code))
      .map((l) => l.code)

    if (removedLocationCodes.length > 0) {
      const defaultCounter = await prisma.counter.findUnique({
        where: { name: DEFAULT_COUNTER_NAME },
      })

      await prisma.staffUser.updateMany({
        where: {
          locationCode: { in: removedLocationCodes },
          counterId: id,
        },
        data: { counterId: defaultCounter?.id ?? null },
      })
    }
  }

  // Update locations if provided, otherwise keep existing relations
  const locationData = locations
    ? {
        locations: {
          set: locations.map((loc) => ({ code: loc.code })),
        },
      }
    : {}

  // Update staffUsers if provided, otherwise keep existing relations
  const staffUserData = staffUsers
    ? {
        staffUsers: {
          set: staffUsers.map((u) => ({ guid: u.guid })),
        },
      }
    : {}

  const updatedCounter = await prisma.counter.update({
    where: { id },
    data: {
      ...data,
      ...locationData,
      ...staffUserData,
      updatedAt: new Date(),
    },
    include: { locations: true, staffUsers: true },
  })

  return updatedCounter
}
