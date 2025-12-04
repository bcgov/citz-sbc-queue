"use server"

import type { Prisma, StagingStaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to retrieve all staging staff users from the database.
 * @param where Optional Prisma filter to narrow down the results
 * @returns Promise resolving to an array of StagingStaffUser objects
 */
export const getStagingStaffUsers = async (
  where: Prisma.StagingStaffUserWhereInput = {}
): Promise<StagingStaffUser[]> => {
  const staffUsers = await prisma.stagingStaffUser.findMany({ where })
  return staffUsers
}
