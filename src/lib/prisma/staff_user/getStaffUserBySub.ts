"use server"

import type { StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

/**
 * Function to retrieve a staff user by their subject identifier.
 * @param sub The subject identifier of the staff user
 * @returns Promise resolving to a StaffUser object or null if not found
 */
export const getStaffUserBySub = async (sub: string): Promise<StaffUser | null> => {
  const staffUser = await prisma.staffUser.findUnique({ where: { sub } })
  return staffUser
}
