import type { Dispatch, SetStateAction } from "react"
import { SelectInput } from "@/components/common/select"
import type { Role } from "@/generated/prisma/client"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { Section } from "./Section"

type RoleAndAssignmentSectionProps = {
  user: StaffUserWithRelations
  locations: LocationWithRelations[]
  counters: CounterWithRelations[]
  setFormData: Dispatch<SetStateAction<StaffUserWithRelations | null>>
  availableRoles: Role[]
  canEditLocation: boolean
  disabled?: boolean
}

export const RoleAndAssignmentSection = ({
  user,
  locations,
  counters,
  setFormData,
  availableRoles,
  canEditLocation,
  disabled = false,
}: RoleAndAssignmentSectionProps) => {
  const locationCounters = counters.filter((c) =>
    c.locations.some((l) => l.code === user.locationCode)
  )

  const defaultCounter = counters.find((c) => c.name === "Counter") ?? null

  const handleLocationChange = (value: string) => {
    setFormData(
      (prev) => prev && { ...prev, locationCode: value, counterId: defaultCounter?.id ?? null }
    )
  }

  return (
    <Section title="Assignment" disabled={disabled ?? false}>
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
        onChange={handleLocationChange}
        disabled={!canEditLocation || disabled}
        options={locations
          .filter((location) => location.deletedAt === null)
          .map((location) => ({
            value: location.code,
            label: `${location.name} (${location.code})`,
          }))}
      />

      <SelectInput
        id="counterId"
        label="Counter"
        value={user.counterId !== null ? user.counterId : undefined}
        onChange={(value) => setFormData((prev) => prev && { ...prev, counterId: value })}
        disabled={disabled || !user.locationCode || locationCounters.length === 0}
        options={locationCounters.map((counter) => ({ value: counter.id, label: counter.name }))}
      />
    </Section>
  )
}
