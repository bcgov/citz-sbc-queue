"use server"

import type { Role } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"
import { assignRole } from "@/utils/sso/assignRole"
import { unassignRole } from "@/utils/sso/unassignRole"
import type { StaffUserWithRelations } from "./types"

/**
 * Function to update a staff user in the database and sso.
 * @param user Data to update the staff user with
 * @param prevUser Previous data of the staff user
 * @param availableRoles Roles that can be assigned by the current user
 * @returns Promise resolving to the updated StaffUser object or null if not found
 */
export const updateStaffUser = async (
  user: Partial<StaffUserWithRelations>,
  prevUser: Partial<StaffUserWithRelations>,
  availableRoles: Role[] = []
): Promise<StaffUserWithRelations | null> => {
  const {
    guid,
    sub,
    location: _location,
    counter: _counter,
    locationCode,
    counterId,
    ...data
  } = user
  if (!guid && !prevUser.guid) return null

  // Use provided guid or fall back to previous user's guid
  const guidToUpdate = guid || prevUser.guid

  // Only allow user to assign roles equal to or lower than their own role
  if (user.role && !availableRoles.includes(user.role)) {
    throw new Error("You do not have permission to assign this role.")
  }

  const locationData = locationCode ? { connect: { code: locationCode } } : undefined
  const counterData = counterId ? { connect: { id: counterId } } : undefined

  const staffUser = await prisma.staffUser.update({
    where: { guid: guidToUpdate },
    data: { ...data, location: locationData, counter: counterData, updatedAt: new Date() },
    include: { location: true, counter: true },
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
