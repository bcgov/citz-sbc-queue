import { permissions } from "./permissions"
import type { PermissionRequest, UserContext } from "./types"

/**
 * Evaluates a list of permission checks against a given user context.
 *
 * @param checks - An array of objects each containing an action string and associated data.
 * @param user_context - The context of the user for whom permissions are being checked.
 * @returns An array of action strings that the user is permitted to perform.
 */
export const hasPermissions = (
  checks: PermissionRequest[],
  user_context: UserContext
): string[] => {
  return checks
    .filter(({ action, data }) => {
      const check = permissions[action]

      if (!check) {
        return false
      }

      return check(user_context, data)
    })
    .map(({ action }) => action)
}
