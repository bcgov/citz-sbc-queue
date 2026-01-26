"use server"

import { prisma } from "@/utils/db/prisma"

/**
 * Change the availability status of a staff user by their sub.
 * @param sub The sub of the staff user
 * @param isAvailable The new availability status
 * @returns The updated availability status
 */
export const toggleAvailabilityBySub = async (
  sub: string,
  isAvailable: boolean
): Promise<boolean> => {
  const staffUser = await prisma.staffUser.update({
    where: { sub },
    data: { isActive: isAvailable, updatedAt: new Date() },
  })

  return staffUser.isActive
}
