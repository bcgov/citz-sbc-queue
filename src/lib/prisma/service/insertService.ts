"use server"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import type { ServiceWithRelations } from "./types"

/**
 * Function to insert a service in the database.
 * @param service Data to insert the service with
 * @returns Promise resolving to the inserted Service object
 */
export const insertService = async (
  service: Partial<ServiceWithRelations>
): Promise<ServiceWithRelations> => {
  if (!service.code || !service.ticketPrefix || !service.name || !service.publicName) {
    throw new Error("Code, Ticket Prefix, Name, and Public Name are required to insert a service.")
  }

  const { locations, categories, ...rest } = service

  // map locations and categories to Prisma connect shape when provided
  const data: Prisma.ServiceCreateInput = {
    ...(rest as Prisma.ServiceCreateInput),
    ...(locations && locations.length > 0
      ? { locations: { connect: locations.map((l) => ({ code: l.code })) } }
      : {}),
    ...(categories && categories.length > 0
      ? { categories: { connect: categories.map((c) => ({ id: c.id })) } }
      : {}),
  }

  const newService = await prisma.service.create({
    data,
    include: { locations: true, categories: true },
  })
  return newService
}
