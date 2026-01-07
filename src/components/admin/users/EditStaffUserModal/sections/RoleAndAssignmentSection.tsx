import type { Dispatch, SetStateAction } from "react"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { Section } from "./common/Section"
import { SelectInput } from "./common/SelectInput"

type RoleAndAssignmentSectionProps = {
  user: StaffUser
  offices: Location[]
  setFormData: Dispatch<SetStateAction<StaffUser | null>>
  availableRoles: Role[]
  disabled?: boolean
}

/**
 * RoleAndAssignmentSection component displays role and office assignment options for a staff user.
 *
 * @param props - The properties object.
 * @property props.user - The staff user whose role and assignment are being edited.
 * @property props.setFormData - Function to update the form data state.
 * @property props.availableRoles - List of roles that can be assigned.
 * @property props.disabled - Whether the section inputs are disabled.
 */
export const RoleAndAssignmentSection = ({
  user,
  offices,
  setFormData,
  availableRoles,
  disabled,
}: RoleAndAssignmentSectionProps) => {
  return (
    <Section title="Role and Assignment" disabled={disabled ?? false}>
      <SelectInput
        id="role"
        label="Role"
        value={user.role}
        onChange={(value) => setFormData((prev) => prev && { ...prev, role: value as Role })}
        disabled={disabled ?? false}
        options={availableRoles.map((role) => ({ value: role, label: role }))}
      />

      <SelectInput
        id="locationId"
        label="Office"
        value={user.locationId ?? undefined}
        onChange={(value) => setFormData((prev) => prev && { ...prev, locationId: value })}
        disabled={disabled ?? false}
        options={offices.map((office) => ({
          value: office.id,
          label: office.legacyOfficeNumber
            ? `${office.name} (No. ${office.legacyOfficeNumber})`
            : office.name,
        }))}
      />
    </Section>
  )
}
