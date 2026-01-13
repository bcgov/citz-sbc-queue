import { request } from "./utils/request"

/**
 * Unassigns a role from a user in SSO.
 * @param sub - The subject identifier of the user.
 * @param role - The role to be unassigned.
 */
export const unassignRole = async (sub: string, role: string): Promise<void> => {
  "use server"
  await request({
    integrationEndpoint: true,
    endpoint: `users/${encodeURIComponent(sub)}/roles/${encodeURIComponent(role)}`,
    method: "DELETE",
  })
}
