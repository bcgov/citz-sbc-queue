import type { Prisma } from "@/generated/prisma/client"

export type LocationWithRelations = Prisma.LocationGetPayload<{
  include: { services: true; counters: true; staffUsers: true }
}>
