"use server"

import type { CSR } from "@/generated/prisma/client"
import { legacyPrisma } from "@/utils/db/prisma"

/**
 * Function to retrieve a csr by their username.
 * @param username The username of the CSR
 * @returns Promise resolving to a CSR object or null if not found
 */
export const getCSRByUsername = async (username: string): Promise<CSR | null> => {
  const csr = await legacyPrisma.csr.findUnique({ where: { username } })
  return csr
}
