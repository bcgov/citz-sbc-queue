import { useMemo } from "react"
import type { Role } from "@/generated/prisma/client"
import { Role as RoleMap } from "@/generated/prisma/enums"
import { useAuth } from "@/hooks/useAuth"

/**
 * Hook to get editable roles for the current user.
 * Returns the current user's role and all lower roles in the hierarchy.
 * Only roles at or below the user's level can be edited/assigned to other users.
 *
 * @returns Array of roles that can be edited (current user's role and all lower roles)
 */
export const useEditableRoles = (): Role[] => {
  const { hasRole } = useAuth()

  const editableRoles = useMemo(() => {
    const roleHierarchy = Object.values(RoleMap)

    // Find the user's highest role by testing each role in reverse order
    let userRoleIndex = -1
    for (let i = roleHierarchy.length - 1; i >= 0; i--) {
      if (hasRole(roleHierarchy[i])) {
        userRoleIndex = i
        break
      }
    }

    if (userRoleIndex === -1) return []

    return roleHierarchy.slice(0, userRoleIndex + 1)
  }, [hasRole])

  return editableRoles
}
