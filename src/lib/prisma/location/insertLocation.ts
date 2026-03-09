"use server"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import type { LocationWithRelations } from "./types"

/**
 * Function to insert a location in the database.
 * @param location Data to insert the location with
 * @returns Promise resolving to the inserted Location object
 */
export const insertLocation = async (
  location: Partial<LocationWithRelations>
): Promise<LocationWithRelations> => {
  if (!location.name) {
    throw new Error("Name is required to insert a location.")
  }

  const { services, counters, staffUsers, ...rest } = location

  // map services to Prisma connect shape when provided
  const data: Prisma.LocationCreateInput = {
    ...(rest as Prisma.LocationCreateInput),
    ...(services && services.length > 0
      ? { services: { connect: services.map((s) => ({ code: s.code })) } }
      : {}),
    ...(counters && counters.length > 0
      ? { counters: { connect: counters.map((c) => ({ id: c.id })) } }
      : {}),
    ...(staffUsers && staffUsers.length > 0
      ? { staffUsers: { connect: staffUsers.map((u) => ({ guid: u.guid })) } }
      : {}),
  }

  const newLocation = await prisma.location.create({
    data,
    include: { services: true, counters: true, staffUsers: true },
  })
  return newLocation
}
