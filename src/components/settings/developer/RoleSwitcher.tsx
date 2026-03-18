"use client"

import { useState } from "react"
import { SelectInput } from "@/components/common/select"
import type { Role, StaffUser } from "@/generated/prisma/client"

type RoleSwitcherProps = {
  currentUser: StaffUser
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles?: Role[]
  ) => Promise<StaffUser | null>
  revalidatePage: () => Promise<void>
}

const AVAILABLE_ROLES: Role[] = ["Authenticated", "CSR", "SCSR", "SDM", "Administrator"]

export const RoleSwitcher = ({
  currentUser,
  updateStaffUser,
  revalidatePage,
}: RoleSwitcherProps) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentUser.role) return

    try {
      setIsUpdating(true)
      setError(null)
      await updateStaffUser({ ...currentUser, role: newRole }, currentUser, AVAILABLE_ROLES)
      await revalidatePage()
      setIsUpdating(false)
      window.location.href = "/protected/settings/developer"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update role")
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="w-[33%]">
        <SelectInput
          id="role-switcher"
          label="Current Role"
          value={currentUser.role}
          onChange={(value) => handleRoleChange(value as Role)}
          disabled={isUpdating}
          options={AVAILABLE_ROLES.map((role) => ({
            value: role,
            label: role,
          }))}
        />
        {isUpdating && <p className="mt-2 text-sm text-gray-600">Updating role...</p>}
      </div>
      {error && (
        <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
