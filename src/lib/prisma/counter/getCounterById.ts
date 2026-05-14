"use server"

import { prisma } from "@/utils/db/prisma"
import type { CounterWithRelations } from "./types"

/**
 * Function to retrieve a counter by its id.
 * @param id The id of the counter
 * @returns Promise resolving to a Counter object with its relations or null if not found
 */
export const getCounterById = async (id: string): Promise<CounterWithRelations | null> => {
  const counter = await prisma.counter.findUnique({
    where: { id },
    include: { locations: true, staffUsers: true },
  })
  return counter
}
