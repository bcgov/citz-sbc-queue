"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useCreateServiceModal } from "@/hooks/settings/services/useCreateServiceModal"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { ServiceForm } from "../ServiceForm"

type CreateServiceModalProps = {
  open: boolean
  onClose: () => void
  locations: LocationWithRelations[]
  categories: ServiceCategoryWithRelations[]
  insertService: (service: Partial<ServiceWithRelations>) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const CreateServiceModal = ({
  open,
  onClose,
  locations,
  categories,
  insertService,
  doesServiceCodeExist,
  revalidateTable,
}: CreateServiceModalProps) => {
  const { isSaving, error, formData, setFormData, isReadonly, isSaveDisabled, handleSave } =
    useCreateServiceModal({
      open,
      onClose,
      insertService,
      doesServiceCodeExist,
      revalidateTable,
    })

  if (!formData) return null

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Create Service</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <ServiceForm
            service={formData}
            locations={locations}
            categories={categories}
            setFormData={setFormData}
            doesServiceCodeExist={doesServiceCodeExist}
            isReadonly={isReadonly}
          />
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="primary" onClick={handleSave} disabled={isSaveDisabled}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
