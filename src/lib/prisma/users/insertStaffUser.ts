"use server"

import type { Prisma, StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to insert a new staff user in the database.
 * @param data Data to create the staff user with
 * @returns Promise resolving to the created StaffUser object
 */
export const insertStaffUser = async (
  data: Prisma.StaffUserCreateInput
): Promise<StaffUser | null> => {
  const staffUser = await prisma.staffUser.create({ data })
  return staffUser
}
