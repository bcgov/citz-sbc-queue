import { request } from "./utils/request"

/**
 * Unassigns a role from a user in SSO.
 * @param username - The username of the user.
 * @param role - The role to be unassigned.
 */
export const unassignRole = async (username: string, role: string): Promise<void> => {
  "use server"
  await request({
    integrationEndpoint: true,
    endpoint: `users/${encodeURIComponent(username)}/roles/${encodeURIComponent(role)}`,
    method: "DELETE",
  })
}
