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
import { useEditServiceCategoryModal } from "@/hooks/settings/service_categories/useEditServiceCategoryModal"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { ServiceCategoryForm } from "../ServiceCategoryForm"

type EditServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  serviceCategory: ServiceCategoryWithRelations | null
  services: Service[]
  canEdit: boolean
  canArchive: boolean
  updateServiceCategory: (
    serviceCategory: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
  openConfirmArchiveServiceCategoryModal: () => void
}

export const EditServiceCategoryModal = ({
  open,
  onClose,
  serviceCategory,
  services,
  canEdit,
  canArchive,
  updateServiceCategory,
  revalidateTable,
  openConfirmArchiveServiceCategoryModal,
}: EditServiceCategoryModalProps) => {
  const {
    isSaving,
    error,
    formData,
    setFormData,
    isArchived,
    isReadonly,
    isSaveDisabled,
    handleSave,
    handleOpenArchive,
  } = useEditServiceCategoryModal({
    open,
    onClose,
    serviceCategory,
    services,
    canEdit,
    canArchive,
    updateServiceCategory,
    revalidateTable,
    openConfirmArchiveServiceCategoryModal,
  })

  if (!serviceCategory || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="md">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Category: {serviceCategory.name}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {!canEdit && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                You do not have permission to edit this service category.
              </p>
            </div>
          )}

          {isArchived && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                This service category is archived and cannot be edited.
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <ServiceCategoryForm
            serviceCategory={formData}
            services={services}
            setFormData={setFormData}
            isReadonly={isReadonly}
          />
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        {canArchive && (
          <button type="button" className="secondary danger" onClick={handleOpenArchive}>
            {isArchived ? "Unarchive" : "Archive"}
          </button>
        )}
        <button type="button" className="primary" onClick={handleSave} disabled={isSaveDisabled}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
