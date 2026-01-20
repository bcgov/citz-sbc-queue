import type { Role } from "@/generated/prisma/enums"

export type UserContext = {
  staff_user_id: string | null
  role: Role | null
}

export type PermissionCheck = (user_context: UserContext, data: Record<string, unknown>) => boolean

export type PermissionMap = Record<string, PermissionCheck>

export type PermissionRequest = {
  action: string
  data: Record<string, unknown>
}
