import { request } from "./utils/request"

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
  })) as Response

  const normalizedRoles = response.data.map((role) => role.name)

  return normalizedRoles
}
