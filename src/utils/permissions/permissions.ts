import type { PermissionCheck } from "./types"

/**
 * A map of permission checks for various actions.
 * Each permission check is a function that takes a UserContext and
 * a data object, and returns a boolean indicating whether the action is permitted.
 */
export const permissions: Record<string, PermissionCheck> = {
  "create-comment": (user_context) => {
    // Any logged-in staff user can create a comment
    const { staff_user_id } = user_context
    return Boolean(staff_user_id)
  },
  "delete-comment": (user_context, data) => {
    // Only administrators or the owner of the comment can delete it
    const { staff_user_id, role } = user_context

    if (!staff_user_id) return false

    const isAdmin = role === "Administrator"
    const isOwner = data.commentOwnerId === staff_user_id

    return isAdmin || isOwner
  },
}
