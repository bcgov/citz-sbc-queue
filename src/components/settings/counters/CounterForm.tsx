import type { Dispatch, SetStateAction } from "react"
import { TextField } from "@/components/common"
import { MultiSelect } from "@/components/common/select/MultiSelect"
import { useCounterForm } from "@/hooks/settings/counters/useCounterForm"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"

export type CounterFormProps = {
  counter: Partial<CounterWithRelations>
  locations: LocationWithRelations[]
  staffUsers: StaffUserWithRelations[]
  setFormData: Dispatch<SetStateAction<Partial<CounterWithRelations> | null>>
  isReadonly: boolean
}

/**
 * CounterForm component renders the form fields for editing a counter.
 *
 * @param props - The properties object.
 * @property props.counter - The counter being edited.
 * @property props.locations - List of office locations.
 * @property props.staffUsers - List of staff users for assignment.
 * @property props.setFormData - Function to update the form data state.
 * @property props.isReadonly - Whether the section inputs are read-only.
 */
export const CounterForm = ({
  counter,
  locations,
  staffUsers,
  setFormData,
  isReadonly,
}: CounterFormProps) => {
  const {
    selectedLocationCodes,
    locationOptions,
    selectedStaffUserGuids,
    staffUserOptions,
    handleNameChange,
    handleLocationsChange,
    handleStaffUsersChange,
  } = useCounterForm({ counter, locations, staffUsers, setFormData })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <TextField
          id="counter-name"
          label="Name"
          value={counter.name || ""}
          onChange={handleNameChange}
          disabled={isReadonly}
          required
        />
        <div className="col-span-1" />
      </div>
      <MultiSelect
        id="counter-locations"
        label="Locations"
        options={locationOptions}
        selected={selectedLocationCodes}
        onChange={handleLocationsChange}
        placeholder="Select locations"
        disabled={isReadonly}
      />
      <MultiSelect
        id="counter-staffUsers"
        label="Staff Users"
        options={staffUserOptions}
        selected={selectedStaffUserGuids}
        onChange={handleStaffUsersChange}
        placeholder={selectedLocationCodes.length === 0 ? "Select locations first" : "Select staff"}
        disabled={isReadonly || selectedLocationCodes.length === 0}
      />
    </div>
  )
}
