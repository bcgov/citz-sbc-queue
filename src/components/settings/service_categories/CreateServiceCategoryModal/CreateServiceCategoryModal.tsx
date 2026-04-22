"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { Service } from "@/generated/prisma/client"
import { useCreateServiceCategoryModal } from "@/hooks/settings/service_categories/useCreateServiceCategoryModal"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { ServiceCategoryForm } from "../ServiceCategoryForm"

type CreateServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  services: Service[]
  insertServiceCategory: (
    service: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const CreateServiceCategoryModal = ({
  open,
  onClose,
  services,
  insertServiceCategory,
  revalidateTable,
}: CreateServiceCategoryModalProps) => {
  const { isSaving, error, formData, setFormData, isReadonly, isSaveDisabled, handleSave } =
    useCreateServiceCategoryModal({
      open,
      onClose,
      services,
      insertServiceCategory,
      revalidateTable,
    })

  if (!formData) return null

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Create Service Category</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <ServiceCategoryForm
            serviceCategory={formData}
            setFormData={setFormData}
            services={services}
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
