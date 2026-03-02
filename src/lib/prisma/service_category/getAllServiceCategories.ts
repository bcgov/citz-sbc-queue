"use server"

import { prisma } from "@/utils/db/prisma"
import type { ServiceCategoryWithRelations } from "./types"

/**
 * Function to retrieve all service categories.
 * @returns Promise resolving to an array of ServiceCategory objects with their relations
 */
export const getAllServiceCategories = async (): Promise<ServiceCategoryWithRelations[]> => {
  const serviceCategories = (
    await prisma.serviceCategory.findMany({ include: { services: true } })
  ).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime() // Sort by createdAt descending, newest first
  )
  return serviceCategories
}
