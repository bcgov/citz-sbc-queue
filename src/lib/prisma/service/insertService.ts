"use server"

import type { Prisma, Service } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to insert a service in the database.
 * @param service Data to insert the service with
 * @returns Promise resolving to the inserted Service object
 */
export const insertService = async (service: Prisma.ServiceCreateInput): Promise<Service> => {
  if (!service.code || !service.ticketPrefix || !service.name || !service.publicName) {
    throw new Error("Code, Ticket Prefix, Name, and Public Name are required to insert a service.")
  }

  const newService = await prisma.service.create({ data: { ...service } })
  return newService
}
