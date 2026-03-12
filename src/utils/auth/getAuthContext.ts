import type { SSOIdirUser } from "./types"

/**
 * Extracts authentication context from headers set by the authentication middleware.
 *
 * Expected headers (set by middleware):
 * - `x-user-token`: JWT access token
 * - `x-user-info`: Serialized user object (SSOIdirUser)
 * - `x-user-roles`: JSON array of user roles
 *
 * @param headers - The Headers object (from NextRequest or next/headers)
 * @returns Object containing { user, token, roles } or null if not authenticated
 */
export function getAuthContext(headers: Headers) {
  try {
    const token = headers.get("x-user-token")
    const userInfoHeader = headers.get("x-user-info")
    const userRolesHeader = headers.get("x-user-roles")

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
