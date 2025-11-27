"use server"

import type { Prisma, StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to retrieve all staff users from the database.
 * @param where Optional Prisma filter to narrow down the results
 * @returns Promise resolving to an array of StaffUser objects
 */
export const getStaffUsers = async (
  where: Prisma.StaffUserWhereInput = {}
): Promise<StaffUser[]> => {
  const staffUsers = await prisma.staffUser.findMany({ where })
  return staffUsers
}
