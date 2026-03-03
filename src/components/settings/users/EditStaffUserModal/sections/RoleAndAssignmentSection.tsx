import type { Dispatch, SetStateAction } from "react"
import { SelectInput } from "@/components/common/select"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { Section } from "./Section"

type RoleAndAssignmentSectionProps = {
  user: StaffUser
  offices: Location[]
  setFormData: Dispatch<SetStateAction<StaffUser | null>>
  availableRoles: Role[]
  disabled?: boolean
}

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
        value={user.locationId === null ? undefined : user.locationId}
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
