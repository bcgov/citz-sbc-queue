import { request } from "./utils/request"

type RoleResponse = {
  data: {
    name: string
  }[]
}

/**
 * Assigns a role to a user in the SSO system.
 * @param username - The username of the user.
 * @param role - The role to assign.
 * @returns The updated list of roles for the user.
 */
export const assignRole = async (username: string, role: string): Promise<string[]> => {
  "use server"
  const response = (await request({
    integrationEndpoint: true,
    endpoint: `users/${encodeURIComponent(username)}/roles`,
    method: "POST",
    body: [
      {
        name: role,
      },
    ],
  })) as RoleResponse

  if (!response || !response.data) {
    throw new Error("Invalid response from CSS API")
  }

  const normalizedRoles = response.data.map((role) => role.name)

  return normalizedRoles
}
