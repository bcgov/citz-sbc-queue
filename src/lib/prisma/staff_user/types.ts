import type { Prisma } from "@/generated/prisma/client"

export type StaffUserWithRelations = Prisma.StaffUserGetPayload<{
  include: { location: true; counter: true }
}>
