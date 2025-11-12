import type { NextRequest } from "next/server"
import type { SSOIdirUser } from "./types"

/**
 * Extracts authentication context from request headers set by the authentication middleware.
 *
 * Expected headers (set by middleware):
 * - `x-user-token`: JWT access token
 * - `x-user-info`: Serialized user object (SSOIdirUser)
 * - `x-user-roles`: JSON array of user roles
 *
 * @param request - The NextRequest object
 * @returns Object containing { user, token, roles } or null if not authenticated
 */
export function getAuthContext(request: NextRequest) {
  try {
    const token = request.headers.get("x-user-token")
    const userInfoHeader = request.headers.get("x-user-info")
    const userRolesHeader = request.headers.get("x-user-roles")

    if (!token || !userInfoHeader) {
      return null
    }

    const user = JSON.parse(userInfoHeader) as SSOIdirUser
    const roles = userRolesHeader ? (JSON.parse(userRolesHeader) as string[]) : []

    return {
      user,
      token,
      roles,
    }
  } catch (error) {
    console.error("Error parsing auth context:", error)
    return null
  }
}
