import type { Dispatch, SetStateAction } from "react"
import { useMemo } from "react"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"

type UseCounterFormProps = {
  counter: Partial<CounterWithRelations>
  locations: LocationWithRelations[]
  staffUsers: StaffUserWithRelations[]
  setFormData: Dispatch<SetStateAction<Partial<CounterWithRelations> | null>>
}

/**
 * Custom hook encapsulating all logic for the CounterForm component.
 *
 * @param props - Hook configuration.
 * @property props.counter - The counter being edited.
 * @property props.locations - List of office locations.
 * @property props.staffUsers - List of all staff users.
 * @property props.setFormData - Function to update the form data state.
 * @returns Derived values and change handlers for the counter form.
 */
export const useCounterForm = ({
  counter,
  locations,
  staffUsers,
  setFormData,
}: UseCounterFormProps) => {
  const selectedLocationCodes = counter.locations ? counter.locations.map((l) => l.code) : []

  const availableLocations = locations.filter((location) => location.deletedAt === null)
  const locationOptions = useMemo(
    () => availableLocations.map((l) => ({ key: l.code, label: l.name })),
    [availableLocations]
  )

  const selectedStaffUserGuids = counter.staffUsers ? counter.staffUsers.map((u) => u.guid) : []

  // Only show staff users who belong to one of the selected locations and are not deleted
  const availableStaffUsers = useMemo(
    () =>
      staffUsers.filter(
        (u) =>
          u.deletedAt === null &&
          u.locationCode !== null &&
          selectedLocationCodes.includes(u.locationCode as string)
      ),
    [staffUsers, selectedLocationCodes]
  )

  const staffUserOptions = useMemo(
    () => availableStaffUsers.map((u) => ({ key: u.guid, label: u.displayName })),
    [availableStaffUsers]
  )

  const handleNameChange = (v: string) => setFormData((s) => (s ? { ...s, name: v } : s))

  const handleLocationsChange = (selected: string[]) =>
    setFormData((s) => {
      if (!s) return s
      const newLocations = selected.map(
        (code) => locations.find((l) => l.code === code) as LocationWithRelations
      )
      // Remove any assigned staff users who no longer belong to the selected locations
      const updatedStaffUsers = (s.staffUsers ?? []).filter(
        (u) => u.locationCode !== null && selected.includes(u.locationCode as string)
      )
      return { ...s, locations: newLocations, staffUsers: updatedStaffUsers }
    })

  const handleStaffUsersChange = (selected: string[]) =>
    setFormData((s) =>
      s
        ? {
            ...s,
            staffUsers: selected.map(
              (guid) => staffUsers.find((u) => u.guid === guid) as StaffUserWithRelations
            ),
          }
        : s
    )

  return {
    selectedLocationCodes,
    locationOptions,
    selectedStaffUserGuids,
    staffUserOptions,
    handleNameChange,
    handleLocationsChange,
    handleStaffUsersChange,
  }
}
