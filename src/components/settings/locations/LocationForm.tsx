import type { Dispatch, SetStateAction } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Notice, TextField } from "@/components/common"
import { MultiSelect } from "@/components/common/select/MultiSelect"
import type { Counter, StaffUser } from "@/generated/prisma/client"
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
  const [codeExists, setCodeExists] = useState<boolean | null>(null)
  const initialCodeRef = useRef<string | undefined>(initialCode ?? location.code)

  const selectedServiceCodes = location.services ? location.services.map((s) => s.code) : []
  const availableServices = services.filter((service) => service.deletedAt === null)
  const serviceOptions = useMemo(
    () => availableServices.map((o) => ({ key: o.code, label: o.name })),
    [availableServices]
  )

  const selectedCounterIds = location.counters ? location.counters.map((c) => c.id) : []
  const counterOptions = useMemo(
    () => counters.map((o) => ({ key: o.id, label: o.name })),
    [counters]
  )

  const selectedStaffUserIds = location.staffUsers ? location.staffUsers.map((u) => u.guid) : []
  const staffUserOptions = useMemo(
    () => staffUsers.map((o) => ({ key: o.guid, label: o.displayName })),
    [staffUsers]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    // when the location changes (new location loaded) reset initial code and state
    initialCodeRef.current = initialCode ?? location.code
    setCodeExists(null)
  }, [location.updatedAt, initialCode])

  useEffect(() => {
    // debounce checking location code existence
    const code = location.code
    if (!code || code.length === 0) {
      setCodeExists(null)
      return
    }

    // don't warn if the code is unchanged from the initial value
    if (initialCodeRef.current === code) {
      setCodeExists(false)
      return
    }

    const t = setTimeout(() => {
      doesLocationCodeExist(code)
        .then((exists) => setCodeExists(exists))
        .catch(() => setCodeExists(null))
    }, 500)

    return () => clearTimeout(t)
  }, [location.code, doesLocationCodeExist])

  return (
    <div className="flex flex-col gap-2">
      {codeExists && <Notice type="warn" message="A location with this code already exists." />}
      <div className="grid grid-cols-9 gap-2">
        <TextField
          id="location-code"
          label="Code"
          value={location.code || ""}
          onChange={(v) => setFormData((s) => (s ? { ...s, code: v.replace(/\s/g, "") } : s))}
          disabled={isReadonly}
          required
          className="col-span-3"
        />

        <TextField
          id="location-name"
          label="Name"
          className="col-span-6"
          value={location.name || ""}
          onChange={(v) => setFormData((s) => (s ? { ...s, name: v } : s))}
          disabled={isReadonly}
          required
        />
      </div>

      <div className="mt-xs grid grid-cols-2 gap-2">
        <MultiSelect
          id="services"
          label="Services"
          options={serviceOptions}
          selected={selectedServiceCodes}
          onChange={(selected) =>
            setFormData((s) =>
              s
                ? {
                    ...s,
                    services: selected.map(
                      (code) => services.find((o) => o.code === code) as ServiceWithRelations
                    ),
                  }
                : s
            )
          }
          placeholder="Select services"
          disabled={isReadonly}
        />
        <MultiSelect
          id="counters"
          label="Counters"
          options={counterOptions}
          selected={selectedCounterIds}
          onChange={(selected) =>
            setFormData((s) =>
              s
                ? {
                    ...s,
                    counters: selected.map((id) => counters.find((c) => c.id === id) as Counter),
                  }
                : s
            )
          }
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
          onChange={(selected) =>
            setFormData((s) =>
              s
                ? {
                    ...s,
                    staffUsers: selected.map(
                      (id) => staffUsers.find((u) => u.guid === id) as StaffUser
                    ),
                  }
                : s
            )
          }
          placeholder="Select staff users"
          disabled={isReadonly}
        />
      </div>
    </div>
  )
}
