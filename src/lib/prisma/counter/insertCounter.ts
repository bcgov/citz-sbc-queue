"use server"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import type { CounterWithRelations } from "./types"

/**
 * Function to insert a counter in the database.
 * @param counter Data to insert the counter with
 * @returns Promise resolving to the inserted Counter object
 */
export const insertCounter = async (
  counter: Partial<CounterWithRelations>
): Promise<CounterWithRelations> => {
  if (!counter.name) {
    throw new Error("Name is required to insert a counter.")
  }

  const { locations, staffUsers, ...rest } = counter

  // map locations and staffUsers to Prisma connect shape when provided
  const data: Prisma.CounterCreateInput = {
    ...(rest as Prisma.CounterCreateInput),
    ...(locations && locations.length > 0
      ? { locations: { connect: locations.map((l) => ({ code: l.code })) } }
      : {}),
    ...(staffUsers && staffUsers.length > 0
      ? { staffUsers: { connect: staffUsers.map((u) => ({ guid: u.guid })) } }
      : {}),
  }

  const newCounter = await prisma.counter.create({
    data,
    include: { locations: true, staffUsers: true },
  })
  return newCounter
}
