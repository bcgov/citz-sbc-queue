import type { Prisma } from "@/generated/prisma/client"

export type ServiceWithRelations = Prisma.ServiceGetPayload<{
  include: { locations: true; categories: true }
}>
