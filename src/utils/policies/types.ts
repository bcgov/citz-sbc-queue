import type { Role } from "@/generated/prisma/enums"

export type UserContext = {
  staff_user_id: string | null
  role: Role | null
}

export type ResourceData = Record<string, unknown> | null

export type Policy = (user_context: UserContext, data: ResourceData) => string[]

export type Policies = Record<string, Policy>

export type PolicyRequest = {
  resource: string
  data?: ResourceData
}
