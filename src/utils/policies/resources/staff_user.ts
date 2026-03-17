import type { Role } from "@/generated/prisma/enums"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import type { Policy } from "../types"

const ROLE_HIERARCHY: Role[] = ["Authenticated", "CSR", "SCSR", "SDM", "Administrator"] as const

// Determines if a user's role is at or above a target role level in the hierarchy.
const canUserEditRole = (userRole: Role | string, targetRole: Role | string): boolean => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole as Role)
  const targetLevel = ROLE_HIERARCHY.indexOf(targetRole as Role)
  return userLevel > -1 && targetLevel > -1 && userLevel >= targetLevel
}

export const StaffUserPolicy: Policy = (user_context, data) => {
  const { staff_user_id, role, location_code } = user_context
  const actions = new Set<string>()

  // View permissions
  if (data?.guid === staff_user_id) actions.add("view") // Users can always view their own record
  if (data?.locationCode === location_code) actions.add("view") // Users can view records in their own location
  if (role === "Administrator") actions.add("view") // Administrators can view all records

  // Edit permissions: user can edit if their role is at or above the target user's role (except for Authenticated role)
  if (
    data?.role &&
    role !== "Authenticated" &&
    canUserEditRole(role ?? "", (data as StaffUserWithRelations).role)
  )
    actions.add("edit")

  // Archive permissions: Admins can archive anyone except themselves
  if (role === "Administrator" && data?.guid !== staff_user_id) actions.add("archive")

  // Role change permissions: user can change roles up to and including their own level
  const editableRoles = ROLE_HIERARCHY.filter((r) => canUserEditRole(role ?? "", r))
  editableRoles.forEach((r) => actions.add(`change_role_to_${r}`))

  // Change users location
  if (data?.guid === staff_user_id) actions.add("change_location") // Users can change their own location
  if (data?.locationCode === location_code && role === "SDM") actions.add("change_location") // SDM users can change location for users in their own location
  if (role === "Administrator") actions.add("change_location") // Admins can change any user's location

  return Array.from(actions)
}
