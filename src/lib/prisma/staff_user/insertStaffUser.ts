"use server"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { assignRole } from "@/utils/sso/assignRole"
import type { StaffUserWithRelations } from "./types"

/**
 * Function to insert a staff user in the database and sso.
 * @param user Data to insert the staff user with
 * @returns Promise resolving to the inserted StaffUser object
 */
export const insertStaffUser = async (
  user: Prisma.StaffUserCreateInput
): Promise<StaffUserWithRelations> => {
  if (!user.guid || !user.sub || !user.role) {
    throw new Error("GUID, SUB, and Role are required to insert a staff user.")
  }

  // Update SSO role
  await assignRole(user.sub, user.role)

  const staffUser = await prisma.staffUser.create({
    data: { ...user },
    include: { location: true, counter: true },
  })
  return staffUser
}
