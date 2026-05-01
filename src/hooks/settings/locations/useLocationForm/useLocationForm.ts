import type { Dispatch, SetStateAction } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import type { AddressSuggestion } from "@/hooks"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type UseLocationFormProps = {
  initialCode?: string
  location: Partial<LocationWithRelations>
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  setFormData: Dispatch<SetStateAction<Partial<LocationWithRelations> | null>>
  doesLocationCodeExist: (code: string) => Promise<boolean>
}

export const TIMEZONE_OPTIONS = [
  { value: "America/Vancouver", label: "Pacific Time (America/Vancouver)" },
  { value: "America/Edmonton", label: "Mountain Time (America/Edmonton)" },
]

/**
 * Custom hook encapsulating all logic for the LocationForm component.
 *
 * @param props - Hook configuration.
 * @property props.initialCode - The initial code of the location, used to determine if the code has changed.
 * @property props.location - The location data currently being edited.
 * @property props.services - Full list of available services.
 * @property props.counters - Full list of available counters.
 * @property props.staffUsers - Full list of available staff users.
 * @property props.setFormData - Setter to update the parent form state.
 * @property props.doesLocationCodeExist - Async function to check if a code is already taken.
 * @returns Derived state, computed options, and change handlers for the form.
 */
export const useLocationForm = ({
  initialCode,
  location,
  services,
  counters,
  staffUsers,
  setFormData,
  doesLocationCodeExist,
}: UseLocationFormProps) => {
  const [codeExists, setCodeExists] = useState<boolean | null>(null)
  const initialCodeRef = useRef<string | undefined>(initialCode ?? location.code)

  // Derived selections
  const selectedServiceCodes = location.services ? location.services.map((s) => s.code) : []
  const selectedCounterIds = location.counters ? location.counters.map((c) => c.id) : []
  const selectedStaffUserIds = location.staffUsers ? location.staffUsers.map((u) => u.guid) : []

  // Computed options
  const availableServices = services.filter((service) => service.deletedAt === null)
  const serviceOptions = useMemo(
    () => availableServices.map((o) => ({ key: o.code, label: o.name })),
    [availableServices]
  )
  const counterOptions = useMemo(
    () => counters.map((o) => ({ key: o.id, label: o.name })),
    [counters]
  )
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

  // Change handlers
  const handleCodeChange = (v: string) => {
    setFormData((s) => (s ? { ...s, code: v.replace(/\s/g, "") } : s))
  }

  const handleNameChange = (v: string) => {
    setFormData((s) => (s ? { ...s, name: v } : s))
  }

  const handleAddressChange = (v: string) => {
    setFormData((s) => {
      if (!s) return s
      if (v.trim() === "") {
        return { ...s, streetAddress: undefined, latitude: undefined, longitude: undefined }
      }
      return { ...s, streetAddress: v }
    })
  }

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setFormData((s) =>
      s
        ? {
            ...s,
            streetAddress: suggestion.streetName ? suggestion.address : undefined,
            latitude: suggestion.coordinates.latitude,
            longitude: suggestion.coordinates.longitude,
          }
        : s
    )
  }

  const handleTimezoneChange = (v: string) => {
    setFormData((s) => (s ? { ...s, timezone: v } : s))
  }

  const handleMailAddressChange = (v: string) => {
    setFormData((s) => (s ? { ...s, mailAddress: v } : s))
  }

  const handlePhoneNumberChange = (v: string) => {
    setFormData((s) => (s ? { ...s, phoneNumber: v } : s))
  }

  const handleServicesChange = (selected: string[]) => {
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

  const handleCountersChange = (selected: string[]) => {
    setFormData((s) =>
      s
        ? {
            ...s,
            counters: selected.map((id) => counters.find((c) => c.id === id) as Counter),
          }
        : s
    )
  }

  const handleStaffUsersChange = (selected: string[]) => {
    setFormData((s) =>
      s
        ? {
            ...s,
            staffUsers: selected.map((id) => staffUsers.find((u) => u.guid === id) as StaffUser),
          }
        : s
    )
  }

  return {
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
  }
}
