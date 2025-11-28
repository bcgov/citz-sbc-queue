import type { Role, StaffUser } from "@/generated/prisma/client"

type RoleAndAssignmentSectionProps = {
  user: StaffUser
  onRoleChange: (role: StaffUser["role"]) => void
  onOfficeIdChange: (officeId: number) => void
  availableRoles: Role[]
  disabled?: boolean
}

/**
 * RoleAndAssignmentSection component displays role and office assignment options for a staff user.
 *
 * @param props - The properties object.
 * @property props.user - The staff user whose role and assignment are being edited.
 * @property props.onRoleChange - Callback when role changes.
 * @property props.onOfficeIdChange - Callback when office ID changes.
 * @property props.availableRoles - List of roles that can be assigned.
 * @property props.disabled - Whether the section inputs are disabled.
 */
export const RoleAndAssignmentSection = ({
  user,
  onRoleChange,
  onOfficeIdChange,
  availableRoles,
  disabled,
}: RoleAndAssignmentSectionProps) => {
  return (
    <div
      className={`space-y-3 rounded-lg border border-border-light bg-background-light-gray p-4 shadow-sm ${disabled ? "opacity-50" : ""}`}
    >
      <h3 className="text-sm font-semibold text-typography-primary">Role & Assignment</h3>

      <div className="space-y-3">
        <div>
          <label htmlFor="role" className="block text-xs font-medium text-typography-primary">
            Role
          </label>
          <select
            id="role"
            value={user.role}
            onChange={(e) => onRoleChange(e.target.value as StaffUser["role"])}
            disabled={disabled}
            className="mt-1 block w-full rounded-md border border-border-dark px-2 py-1 text-xs text-typography-primary disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="officeId" className="block text-xs font-medium text-typography-primary">
            Office
          </label>
          <select
            id="officeId"
            value={user.officeId}
            onChange={(e) => onOfficeIdChange(Number(e.target.value))}
            disabled={disabled}
            className="mt-1 block w-full rounded-md border border-border-dark px-2 py-1 text-xs text-typography-primary disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">Select an office</option>
          </select>
        </div>
      </div>
    </div>
  )
}
