import type { Role } from "@/generated/prisma/enums"
import { assignRole } from "../sso/assignRole"

/**
 * Translates legacy CSR roles to new system roles and assigns them via SSO if a sub is provided.
 * @param sub - The SSO subject identifier
 * @param csrRoleId - The legacy role identifier from csr table
 * @returns The new system role assigned
 */
export const assignNewRoleFromCSR = async (sub: string | null, csrRoleId: number | null) => {
  let newRole: Role = "Authenticated" // Default role for new users without legacy CSR roles
  if (csrRoleId === 1) newRole = "SDM"
  else if (csrRoleId === 30) newRole = "Administrator"
  else if (csrRoleId) newRole = "CSR"

  // If sub, assign new role in SSO
  if (sub) await assignRole(sub, newRole)

  return newRole
}
