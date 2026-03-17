import type { Dispatch, SetStateAction } from "react"
import { SelectInput } from "@/components/common/select"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { Section } from "./Section"

type RoleAndAssignmentSectionProps = {
  user: StaffUser
  locations: Location[]
  setFormData: Dispatch<SetStateAction<StaffUser | null>>
  availableRoles: Role[]
  canEditLocation: boolean
  disabled?: boolean
}

export const RoleAndAssignmentSection = ({
  user,
  locations,
  setFormData,
  availableRoles,
  canEditLocation,
  disabled = false,
}: RoleAndAssignmentSectionProps) => {
  return (
    <Section title="Role and Assignment" disabled={disabled ?? false}>
      <SelectInput
        id="role"
        label="Role"
        value={user.role}
        onChange={(value) => setFormData((prev) => prev && { ...prev, role: value as Role })}
        disabled={disabled}
        options={availableRoles.map((role) => ({ value: role, label: role }))}
      />

      <SelectInput
        id="locationCode"
        label="Location"
        value={user.locationCode === null ? undefined : user.locationCode}
        onChange={(value) => setFormData((prev) => prev && { ...prev, locationCode: value })}
        disabled={!canEditLocation || disabled}
        options={locations
          .filter((location) => location.deletedAt === null)
          .map((location) => ({
            value: location.code,
            label: `${location.name} (${location.code})`,
          }))}
      />
    </Section>
  )
}
