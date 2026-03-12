import type { Role } from "@/generated/prisma/enums"

export type UserContext = {
  staff_user_id: string | null
  role: Role | null
  location_code?: string | null
  receptionist?: boolean
  office_manager?: boolean
  pesticide_designate?: boolean
  finance_designate?: boolean
  ita2_designate?: boolean
}

export type ResourceData = Record<string, unknown> | null

export type Policy = <DataType extends ResourceData = ResourceData>(
  user_context: UserContext,
  data: DataType
) => string[]

export type Policies = Record<string, Policy>

export type PolicyRequest = {
  resource: string
  data?: ResourceData
}
