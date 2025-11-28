"use server"

import type { Prisma, StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to update a staff user in the database.
 * @param where Unique identifier to locate the staff user
 * @param data Data to update the staff user with
 * @returns Promise resolving to the updated StaffUser object or null if not found
 */
export const updateStaffUser = async (
  where: Prisma.StaffUserWhereUniqueInput,
  data: Prisma.StaffUserUpdateInput
): Promise<StaffUser | null> => {
  const staffUser = await prisma.staffUser.update({ where, data })
  return staffUser
}
