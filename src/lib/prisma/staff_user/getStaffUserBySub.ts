"use server"

import { prisma } from "@/utils/db/prisma"
import type { StaffUserWithRelations } from "./types"

/**
 * Function to retrieve a staff user by their subject identifier.
 * @param sub The subject identifier of the staff user
 * @returns Promise resolving to a StaffUserWithRelations object or null if not found
 */
export const getStaffUserBySub = async (sub: string): Promise<StaffUserWithRelations | null> => {
  const staffUser = await prisma.staffUser.findUnique({
    where: { sub },
    include: { location: true, counter: true },
  })
  return staffUser
}
