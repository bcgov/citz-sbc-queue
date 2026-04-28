import type { Dispatch, SetStateAction } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type UseServiceFormProps = {
  service: Partial<ServiceWithRelations>
  initialCode?: string
  locations: LocationWithRelations[]
  categories: ServiceCategoryWithRelations[]
  setFormData: Dispatch<SetStateAction<Partial<ServiceWithRelations> | null>>
  doesServiceCodeExist: (code: string) => Promise<boolean>
}

/**
 * Custom hook encapsulating all logic for the ServiceForm component.
 *
 * @param props - Hook configuration.
 * @property props.service - The service being edited.
 * @property props.initialCode - The initial code of the service, used to determine if the code has changed.
 * @property props.locations - List of office locations.
 * @property props.categories - List of service categories.
 * @property props.setFormData - Function to update the form data state.
 * @property props.doesServiceCodeExist - Function to check if a service code already exists.
 * @returns Derived values and change handlers for the service form.
 */
export const useServiceForm = ({
  service,
  initialCode,
  locations,
  categories,
  setFormData,
  doesServiceCodeExist,
}: UseServiceFormProps) => {
  const [codeExists, setCodeExists] = useState<boolean | null>(null)
  const initialCodeRef = useRef<string | undefined>(initialCode ?? service.code)

  const selectedLocationCodes = service.locations ? service.locations.map((l) => l.code) : []
  const availableLocations = locations.filter((location) => location.deletedAt === null)
  const locationOptions = useMemo(
    () => availableLocations.map((o) => ({ key: o.code, label: o.name })),
    [availableLocations]
  )

  const selectedCategoryIds = service.categories ? service.categories.map((c) => c.id) : []
  const availableCategories = categories.filter((category) => category.deletedAt === null)
  const categoryOptions = useMemo(
    () => availableCategories.map((c) => ({ key: c.id, label: c.name })),
    [availableCategories]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    // when the service changes (new service loaded) reset initial code and state
    initialCodeRef.current = initialCode ?? service.code
    setCodeExists(null)
  }, [service.updatedAt, initialCode])

  useEffect(() => {
    // debounce checking service code existence
    const code = service.code
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
      doesServiceCodeExist(code)
        .then((exists) => setCodeExists(exists))
        .catch(() => setCodeExists(null))
    }, 500)

    return () => clearTimeout(t)
  }, [service.code, doesServiceCodeExist])

  const handleCodeChange = (v: string) =>
    setFormData((s) => (s ? { ...s, code: v.replace(/\s/g, "") } : s))

  const handleTicketPrefixChange = (v: string) =>
    setFormData((s) => (s ? { ...s, ticketPrefix: v } : s))

  const handleBackOfficeChange = (checked: boolean) =>
    setFormData((s) => (s ? { ...s, backOffice: checked } : s))

  const handleNameChange = (v: string) => setFormData((s) => (s ? { ...s, name: v } : s))

  const handlePublicNameChange = (v: string) =>
    setFormData((s) => (s ? { ...s, publicName: v } : s))

  const handleDescriptionChange = (v: string) =>
    setFormData((s) => (s ? { ...s, description: v } : s))

  const handleLocationsChange = (selected: string[]) =>
    setFormData((s) =>
      s
        ? {
            ...s,
            locations: selected.map(
              (code) => locations.find((o) => o.code === code) as LocationWithRelations
            ),
          }
        : s
    )

  const handleCategoriesChange = (selected: string[]) =>
    setFormData((s) =>
      s
        ? {
            ...s,
            categories: selected.map(
              (id) => categories.find((c) => c.id === id) as ServiceCategoryWithRelations
            ),
          }
        : s
    )

  return {
    codeExists,
    selectedLocationCodes,
    locationOptions,
    selectedCategoryIds,
    categoryOptions,
    handleCodeChange,
    handleTicketPrefixChange,
    handleBackOfficeChange,
    handleNameChange,
    handlePublicNameChange,
    handleDescriptionChange,
    handleLocationsChange,
    handleCategoriesChange,
  }
}
