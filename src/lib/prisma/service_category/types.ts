import type { Prisma } from "@/generated/prisma/client"

export type ServiceCategoryWithRelations = Prisma.ServiceCategoryGetPayload<{
  include: { services: true }
}>
