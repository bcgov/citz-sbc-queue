"use server"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export type StaffUserWithLocation = Prisma.StaffUserGetPayload<{
  include: { location: true }
}>

export async function getStaffUserByGuid(guid: string): Promise<StaffUserWithLocation | null> {
  const staffUser = await prisma.staffUser.findUnique({
    where: { guid },
    include: { location: true },
  })

  if (!staffUser || staffUser.deletedAt) return null
  return staffUser
}
