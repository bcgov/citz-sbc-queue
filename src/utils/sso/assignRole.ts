import { request } from "./utils/request"

// TODO: Rename type to avoid confusion with the 'role' parameter (e.g., RoleResponse or AssignRoleResponse)
type Response = {
  data: {
    name: string
  }[]
}

/**
 * Assigns a role to a user in the SSO system.
 * @param {string} username - The username of the user.
 * @param {string} role - The role to assign.
 * @returns {Promise<string[]>} The updated list of roles for the user.
 */
// TODO: Make JSDoc format consistent - use TSDoc style: @param username - Description (no curly braces)
export const assignRole = async (username: string, role: string): Promise<string[]> => {
  "use server"
  // TODO: Remove unsafe type assertion 'as Response' or add runtime validation
  // Validate response structure before accessing response.data to prevent runtime errors
  // Example:
  // if (!response || typeof response !== 'object' || !('data' in response)) {
  //   throw new Error("Invalid response format from CSS API")
  // }
  const response = (await request({
    integrationEndpoint: true,
    endpoint: `users/${encodeURIComponent(username)}/roles`,
    method: "POST",
    body: [
      {
        name: role,
      },
    ],
  })) as Response

  // TODO: Add null/undefined check to prevent crashes if API returns unexpected format
  // if (!response.data || !Array.isArray(response.data)) {
  //   throw new Error("Invalid response format from CSS API")
  // }
  const normalizedRoles = response.data.map((role) => role.name)

  return normalizedRoles
}
