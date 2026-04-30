"use server"

import { prisma } from "@/utils/db/prisma"
import type { CounterWithRelations } from "./types"

/**
 * Function to retrieve a counter by its name.
 * @param name The name of the counter
 * @returns Promise resolving to a Counter object with its relations or null if not found
 */
export const getCounterByName = async (name: string): Promise<CounterWithRelations | null> => {
  const counter = await prisma.counter.findUnique({
    where: { name },
    include: { locations: true, staffUsers: true },
  })
  return counter
}
