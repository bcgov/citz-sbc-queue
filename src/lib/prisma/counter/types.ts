import type { Prisma } from "@/generated/prisma/client"

export type CounterWithRelations = Prisma.CounterGetPayload<{
  include: { locations: true; staffUsers: true }
}>
