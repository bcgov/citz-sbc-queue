"use server"

import { prisma } from "@/utils/db/prisma"
import type { StaffUserWithRelations } from "./types"

/**
 * Function to retrieve all staff users from the database.
 * @returns Promise resolving to an array of StaffUser objects
 */
export const getAllStaffUsers = async (): Promise<StaffUserWithRelations[]> => {
  const staffUsers = await prisma.staffUser.findMany({
    include: { location: true, counter: true },
  })
  return staffUsers
}
