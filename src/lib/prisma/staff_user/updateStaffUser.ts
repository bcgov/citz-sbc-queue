"use server"

import type { Role, StaffUser } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { assignRole } from "@/utils/sso/assignRole"
import { unassignRole } from "@/utils/sso/unassignRole"

/**
 * Function to update a staff user in the database and sso.
 * @param user Data to update the staff user with
 * @param prevUser Previous data of the staff user
 * @param availableRoles Roles that can be assigned by the current user
 * @returns Promise resolving to the updated StaffUser object or null if not found
 */
export const updateStaffUser = async (
  user: Partial<StaffUser>,
  prevUser: Partial<StaffUser>,
  availableRoles: Role[] = []
): Promise<StaffUser | null> => {
  const { guid, sub, ...data } = user
  if (!guid && !prevUser.guid) return null

  // Use provided guid or fall back to previous user's guid
  const guidToUpdate = guid || prevUser.guid

  // Only allow user to assign roles equal to or lower than their own role
  if (user.role && !availableRoles.includes(user.role)) {
    throw new Error("You do not have permission to assign this role.")
  }

  const staffUser = await prisma.staffUser.update({
    where: { guid: guidToUpdate },
    data: { ...data, updatedAt: new Date() },
  })
  if (!staffUser) return null

  // SSO Role Update
  if (sub && user.role !== prevUser.role && user.role && prevUser.role) {
    // Assign new role
    await assignRole(sub, user.role)
    // Remove previous role
    await unassignRole(sub, prevUser.role)
  }

  return staffUser
}
