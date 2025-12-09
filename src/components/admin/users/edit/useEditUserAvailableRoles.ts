import { useMemo } from "react"
import type { Role } from "@/generated/prisma/client"
import { Role as RoleMap } from "@/generated/prisma/enums"
import { useAuth } from "@/hooks/useAuth"

/**
 * Hook to get available roles for editing a user.
 * Returns the current user's role and all lower roles in the hierarchy.
 *
 * @returns Array of available roles that can be assigned
 */
export const useEditUserAvailableRoles = (): Role[] => {
  const { hasRole } = useAuth()

  const availableRoles = useMemo(() => {
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

  return availableRoles
}
