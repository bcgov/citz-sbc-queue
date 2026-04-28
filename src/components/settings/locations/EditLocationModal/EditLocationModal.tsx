"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import { useEditLocationModal } from "@/hooks/settings/locations/useEditLocationModal"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { LocationForm } from "../LocationForm"

type EditLocationModalProps = {
  open: boolean
  onClose: () => void
  location: LocationWithRelations | null
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  canEdit: boolean
  canArchive: boolean
  updateLocation: (
    location: Partial<LocationWithRelations>,
    prevLocation: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  doesLocationCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
  openConfirmArchiveLocationModal: () => void
}

export const EditLocationModal = ({
  open,
  onClose,
  location,
  services,
  counters,
  staffUsers,
  canEdit,
  canArchive,
  updateLocation,
  doesLocationCodeExist,
  revalidateTable,
  openConfirmArchiveLocationModal,
}: EditLocationModalProps) => {
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
  } = useEditLocationModal({
    open,
    onClose,
    location,
    services,
    counters,
    staffUsers,
    canEdit,
    canArchive,
    updateLocation,
    doesLocationCodeExist,
    revalidateTable,
    openConfirmArchiveLocationModal,
  })

  if (!location || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Location: {location.code}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {!canEdit && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                You do not have permission to edit this location.
              </p>
            </div>
          )}

          {isArchived && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                This location is archived and cannot be edited.
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <LocationForm
            location={formData}
            services={services}
            counters={counters}
            staffUsers={staffUsers}
            setFormData={setFormData}
            doesLocationCodeExist={doesLocationCodeExist}
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
