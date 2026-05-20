"use server"

import { prisma } from "@/utils/db/prisma"

const DEFAULT_COUNTER_NAME = "Counter"

/**
 * Function to delete a counter from the database.
 *
 * Before deletion, any staff users assigned to this counter are moved to the
 * default "Counter" counter (or have their counterId set to null if the default
 * counter cannot be found).
 *
 * @param id The id of the counter to delete
 * @returns Promise resolving to true if the counter was deleted, false if not found
 */
export const deleteCounter = async (id: string): Promise<boolean> => {
  const counter = await prisma.counter.findUnique({ where: { id } })
  if (!counter) return false

  const defaultCounter = await prisma.counter.findUnique({
    where: { name: DEFAULT_COUNTER_NAME },
  })

  // Reassign all staff users of this counter to the default counter before deletion
  await prisma.staffUser.updateMany({
    where: { counterId: id },
    data: { counterId: defaultCounter?.id ?? null },
  })

  await prisma.counter.delete({ where: { id } })
  return true
}
