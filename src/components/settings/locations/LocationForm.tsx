/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: <Read only inputs> */
import type { Dispatch, SetStateAction } from "react"
import { Notice, TextField } from "@/components/common"
import { MultiSelect } from "@/components/common/select/MultiSelect"
import { SelectInput } from "@/components/common/select/SelectInput"
import { AddressAutocomplete } from "@/components/geocoder"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import { TIMEZONE_OPTIONS, useLocationForm } from "@/hooks/settings/locations/useLocationForm"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type LocationFormProps = {
  initialCode?: string
  location: Partial<LocationWithRelations>
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  setFormData: Dispatch<SetStateAction<Partial<LocationWithRelations> | null>>
  doesLocationCodeExist: (code: string) => Promise<boolean>
  isReadonly: boolean
}

/**
 * LocationForm component renders the form fields for editing a location.
 *
 * @param props - The properties object.
 * @property props.initialCode - The initial code of the location, used to determine if the code has changed.
 * @property props.location - The location being edited.
 * @property props.services - List of services.
 * @property props.counters - List of counters.
 * @property props.staffUsers - List of staff users.
 * @property props.setFormData - Function to update the form data state.
 * @property props.doesLocationCodeExist - Function to check if a location code already exists.
 * @property props.isReadonly - Whether the section inputs are read-only.
 */
export const LocationForm = ({
  initialCode,
  location,
  services,
  counters,
  staffUsers,
  setFormData,
  doesLocationCodeExist,
  isReadonly,
}: LocationFormProps) => {
  const {
    codeExists,
    selectedServiceCodes,
    selectedCounterIds,
    selectedStaffUserIds,
    serviceOptions,
    counterOptions,
    staffUserOptions,
    handleCodeChange,
    handleNameChange,
    handleAddressChange,
    handleAddressSelect,
    handleTimezoneChange,
    handleMailAddressChange,
    handlePhoneNumberChange,
    handleServicesChange,
    handleCountersChange,
    handleStaffUsersChange,
  } = useLocationForm({
    initialCode,
    location,
    services,
    counters,
    staffUsers,
    setFormData,
    doesLocationCodeExist,
  })

  return (
    <div className="flex flex-col gap-2">
      {codeExists && <Notice type="warn" message="A location with this code already exists." />}
      <div className="grid grid-cols-9 gap-2">
        <TextField
          id="location-code"
          label="Code"
          value={location.code || ""}
          onChange={handleCodeChange}
          disabled={isReadonly}
          required
          className="col-span-3"
        />

        <TextField
          id="location-name"
          label="Name"
          className="col-span-6"
          value={location.name || ""}
          onChange={handleNameChange}
          disabled={isReadonly}
          required
        />
      </div>

      <div className="mt-xs grid grid-cols-5 gap-2">
        <div className="col-span-2">
          <AddressAutocomplete
            id="location-street-address"
            label="Street Address"
            value={location.streetAddress || ""}
            onChange={handleAddressChange}
            onSelect={handleAddressSelect}
            placeholder="Search and select address..."
            disabled={isReadonly}
          />
        </div>
        <div className="col-span-3 flex gap-2">
          <TextField
            id="location-latitude"
            label="Latitude"
            value={location.latitude?.toString() || ""}
            onChange={() => {}}
            disabled
          />
          <TextField
            id="location-longitude"
            label="Longitude"
            value={location.longitude?.toString() || ""}
            onChange={() => {}}
            disabled
          />
          <SelectInput
            id="location-timezone"
            label="Timezone"
            value={location.timezone || ""}
            onChange={handleTimezoneChange}
            disabled={isReadonly}
            options={TIMEZONE_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-xs grid grid-cols-2 gap-2">
        <TextField
          id="location-mail-address"
          label="Mailing Address"
          value={location.mailAddress || ""}
          onChange={handleMailAddressChange}
          disabled={isReadonly}
          placeholder="Optional mailing address"
        />
        <TextField
          id="location-phone"
          label="Phone Number"
          value={location.phoneNumber || ""}
          onChange={handlePhoneNumberChange}
          disabled={isReadonly}
          placeholder="Optional phone number"
        />
      </div>

      <div className="mt-xs grid grid-cols-2 gap-2">
        <MultiSelect
          id="services"
          label="Services"
          options={serviceOptions}
          selected={selectedServiceCodes}
          onChange={handleServicesChange}
          placeholder="Select services"
          disabled={isReadonly}
        />
        <MultiSelect
          id="counters"
          label="Counters"
          options={counterOptions}
          selected={selectedCounterIds}
          onChange={handleCountersChange}
          placeholder="Select counters"
          disabled={isReadonly}
        />
      </div>

      <div className="mt-xs">
        <MultiSelect
          id="staff-users"
          label="Staff Users"
          options={staffUserOptions}
          selected={selectedStaffUserIds}
          onChange={handleStaffUsersChange}
          placeholder="Select staff users"
          disabled={isReadonly}
        />
      </div>
    </div>
  )
}
