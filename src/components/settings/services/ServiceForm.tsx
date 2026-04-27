import type { Dispatch, SetStateAction } from "react"
import { Notice, Switch, TextArea, TextField } from "@/components/common"
import { MultiSelect } from "@/components/common/select/MultiSelect"
import { useServiceForm } from "@/hooks/settings/services/useServiceForm"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type ServiceFormProps = {
  initialCode?: string
  service: Partial<ServiceWithRelations>
  locations: LocationWithRelations[]
  categories: ServiceCategoryWithRelations[]
  setFormData: Dispatch<SetStateAction<Partial<ServiceWithRelations> | null>>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  isReadonly: boolean
}

/**
 * ServiceForm component renders the form fields for editing a service.
 *
 * @param props - The properties object.
 * @property props.initialCode - The initial code of the service, used to determine if the code has changed.
 * @property props.service - The service being edited.
 * @property props.locations - List of office locations.
 * @property props.categories - List of service categories.
 * @property props.setFormData - Function to update the form data state.
 * @property props.doesServiceCodeExist - Function to check if a service code already exists.
 * @property props.isReadonly - Whether the section inputs are read-only.
 */
export const ServiceForm = ({
  initialCode,
  service,
  locations,
  categories,
  setFormData,
  doesServiceCodeExist,
  isReadonly,
}: ServiceFormProps) => {
  const {
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
  } = useServiceForm({
    service,
    initialCode,
    locations,
    categories,
    setFormData,
    doesServiceCodeExist,
  })

  return (
    <div className="flex flex-col gap-2">
      {codeExists && <Notice type="warn" message="A service with this code already exists." />}
      <div className="grid grid-cols-7 gap-2">
        <TextField
          id="service-code"
          label="Code"
          value={service.code || ""}
          onChange={handleCodeChange}
          disabled={isReadonly}
          required
          className="col-span-3"
        />

        <TextField
          id="service-ticketPrefix"
          label="Ticket Prefix"
          value={service.ticketPrefix || ""}
          onChange={handleTicketPrefixChange}
          disabled={isReadonly}
          required
          className="col-span-3"
        />

        <div className="flex flex-col justify-center gap-1">
          <p className="block text-xs font-medium text-typography-primary">Back Office</p>
          <Switch
            checked={service.backOffice || false}
            onChange={handleBackOfficeChange}
            disabled={isReadonly}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextField
          id="service-name"
          label="Name"
          value={service.name || ""}
          onChange={handleNameChange}
          disabled={isReadonly}
          required
        />

        <TextField
          id="service-publicName"
          label="Public Name"
          value={service.publicName || ""}
          onChange={handlePublicNameChange}
          disabled={isReadonly}
          required
        />

        <TextArea
          id="service-description"
          label="Description"
          value={service.description || ""}
          onChange={handleDescriptionChange}
          disabled={isReadonly}
          maxLength={1000}
          className="col-span-2"
        />
      </div>

      <div className="mt-xs grid grid-cols-2 gap-2">
        <MultiSelect
          id="service-locations"
          label="Locations"
          options={locationOptions}
          selected={selectedLocationCodes}
          onChange={handleLocationsChange}
          placeholder="Select locations"
          disabled={isReadonly}
        />
        <MultiSelect
          id="service-categories"
          label="Categories"
          options={categoryOptions}
          selected={selectedCategoryIds}
          onChange={handleCategoriesChange}
          placeholder="Select categories"
          disabled={isReadonly}
        />
      </div>
    </div>
  )
}
