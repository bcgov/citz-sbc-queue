"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useEditServiceModal } from "@/hooks/settings/services/useEditServiceModal"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { ServiceForm } from "../ServiceForm"

type EditServiceModalProps = {
  open: boolean
  onClose: () => void
  service: ServiceWithRelations | null
  locations: LocationWithRelations[]
  categories: ServiceCategoryWithRelations[]
  canEdit: boolean
  canArchive: boolean
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
  openConfirmArchiveServiceModal: () => void
}

export const EditServiceModal = ({
  open,
  onClose,
  service,
  locations,
  categories,
  canEdit,
  canArchive,
  updateService,
  doesServiceCodeExist,
  revalidateTable,
  openConfirmArchiveServiceModal,
}: EditServiceModalProps) => {
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
  } = useEditServiceModal({
    open,
    onClose,
    service,
    canEdit,
    canArchive,
    updateService,
    doesServiceCodeExist,
    revalidateTable,
    openConfirmArchiveServiceModal,
  })

  if (!service || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Service: {service.code}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {!canEdit && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                You do not have permission to edit this service.
              </p>
            </div>
          )}

          {isArchived && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                This service is archived and cannot be edited.
              </p>
            </div>
          )}

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
