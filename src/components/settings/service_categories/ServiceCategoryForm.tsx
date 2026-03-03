import type { Dispatch, SetStateAction } from "react"
import { useMemo } from "react"
import { TextField } from "@/components/common"
import { MultiSelect } from "@/components/common/select/MultiSelect"
import type { Service } from "@/generated/prisma/client"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type ServiceCategoryFormProps = {
  serviceCategory: Partial<ServiceCategoryWithRelations>
  services: Service[]
  setFormData: Dispatch<SetStateAction<Partial<ServiceCategoryWithRelations> | null>>
  isReadonly: boolean
}

/**
 * ServiceCategoryForm component renders the form fields for editing a service category.
 *
 * @param props - The properties object.
 * @property props.serviceCategory - The service category being edited.
 * @property props.services - List of services.
 * @property props.setFormData - Function to update the form data state.
 * @property props.isReadonly - Whether the section inputs are read-only.
 */
export const ServiceCategoryForm = ({
  serviceCategory,
  services,
  setFormData,
  isReadonly,
}: ServiceCategoryFormProps) => {
  const serviceOptions = useMemo(
    () => services.map((s) => ({ key: s.code, label: s.name })),
    [services]
  )

  const selectedServiceCodes = serviceCategory.services
    ? serviceCategory.services.map((s) => s.code)
    : []

  return (
    <div className="flex flex-col gap-2">
      <TextField
        id="name"
        label="Name"
        value={serviceCategory.name || ""}
        onChange={(v) => setFormData((s) => (s ? { ...s, name: v } : s))}
        disabled={isReadonly}
        required
      />

      <div>
        <div className="mt-xs">
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
                        (code) => services.find((s) => s.code === code) as Service
                      ),
                    }
                  : s
              )
            }
            placeholder="Select services"
            disabled={isReadonly}
          />
        </div>
      </div>
    </div>
  )
}
