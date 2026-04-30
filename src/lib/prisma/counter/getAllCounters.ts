"use server"

import { prisma } from "@/utils/db/prisma"
import type { CounterWithRelations } from "./types"

/**
 * Function to retrieve all counters.
 * @returns Promise resolving to an array of Counter objects with their relations
 */
export const getAllCounters = async (): Promise<CounterWithRelations[]> => {
  const counters = (
    await prisma.counter.findMany({ include: { locations: true, staffUsers: true } })
  ).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime() // Sort by createdAt descending, newest first
  )
  return counters
}
