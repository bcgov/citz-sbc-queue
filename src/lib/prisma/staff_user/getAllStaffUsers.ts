"use server"

import type { StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to retrieve all staff users from the database.
 * @returns Promise resolving to an array of StaffUser objects
 */
export const getAllStaffUsers = async (): Promise<StaffUser[]> => {
  const staffUsers = await prisma.staffUser.findMany()
  return staffUsers
}
