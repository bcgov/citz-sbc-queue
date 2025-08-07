import type { SSOUser } from "@bcgov/citz-imb-sso-js-core"
import type { NextRequest } from "next/server"

/**
 * Extracts user information from request headers set by the authentication middleware
 * @param request - The NextRequest object
 * @returns Object containing user, token, and roles or null if not authenticated
 */
export function getAuthContext(request: NextRequest) {
  try {
    const token = request.headers.get("x-user-token")
    const userInfoHeader = request.headers.get("x-user-info")
    const userRolesHeader = request.headers.get("x-user-roles")

    if (!token || !userInfoHeader) {
      return null
    }

    const user = JSON.parse(userInfoHeader) as SSOUser<unknown>
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
