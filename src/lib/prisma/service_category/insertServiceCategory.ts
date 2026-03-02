"use server"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import type { ServiceCategoryWithRelations } from "./types"

/**
 * Function to insert a service category in the database.
 * @param serviceCategory Data to insert the service category with
 * @returns Promise resolving to the inserted ServiceCategory object
 */
export const insertServiceCategory = async (
  serviceCategory: Partial<ServiceCategoryWithRelations>
): Promise<ServiceCategoryWithRelations> => {
  if (!serviceCategory.name) {
    throw new Error("Name is required to insert a service category.")
  }

  const { services, ...rest } = serviceCategory

  // map services to Prisma connect shape when provided
  const data: Prisma.ServiceCategoryCreateInput = {
    ...(rest as Prisma.ServiceCategoryCreateInput),
    ...(services && services.length > 0
      ? { services: { connect: services.map((s) => ({ code: s.code })) } }
      : {}),
  }

  const newServiceCategory = await prisma.serviceCategory.create({
    data,
    include: { services: true },
  })
  return newServiceCategory
}
