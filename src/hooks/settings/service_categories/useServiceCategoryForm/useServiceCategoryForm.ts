import type { Dispatch, SetStateAction } from "react"
import { useMemo } from "react"
import type { Service } from "@/generated/prisma/client"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type UseServiceCategoryFormProps = {
  serviceCategory: Partial<ServiceCategoryWithRelations>
  services: Service[]
  setFormData: Dispatch<SetStateAction<Partial<ServiceCategoryWithRelations> | null>>
}

/**
 * Custom hook encapsulating all logic for the ServiceCategoryForm component.
 *
 * @param props - Hook configuration.
 * @property props.serviceCategory - The service category being edited.
 * @property props.services - Full list of available services.
 * @property props.setFormData - State setter for the form data.
 * @returns Derived values and change handlers for the form.
 */
export const useServiceCategoryForm = ({
  serviceCategory,
  services,
  setFormData,
}: UseServiceCategoryFormProps) => {
  const serviceOptions = useMemo(
    () =>
      services
        .filter((service) => service.deletedAt === null)
        .map((s) => ({ key: s.code, label: s.name })),
    [services]
  )

  const selectedServiceCodes = serviceCategory.services
    ? serviceCategory.services.map((s) => s.code)
    : []

  const handleNameChange = (value: string) => setFormData((s) => (s ? { ...s, name: value } : s))

  const handleServicesChange = (selected: string[]) =>
    setFormData((s) =>
      s
        ? {
            ...s,
            services: selected.map((code) => services.find((svc) => svc.code === code) as Service),
          }
        : s
    )

  return {
    serviceOptions,
    selectedServiceCodes,
    handleNameChange,
    handleServicesChange,
  }
}
