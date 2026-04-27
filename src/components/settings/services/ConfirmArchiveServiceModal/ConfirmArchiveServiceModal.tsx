"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useConfirmArchiveServiceModal } from "@/hooks/settings/services/useConfirmArchiveServiceModal"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type ConfirmArchiveServiceModalProps = {
  open: boolean
  onClose: () => void
  service: ServiceWithRelations | null
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const ConfirmArchiveServiceModal = ({
  open,
  onClose,
  service,
  updateService,
  revalidateTable,
}: ConfirmArchiveServiceModalProps) => {
  const {
    error,
    formData,
    archiveConfirmation,
    setArchiveConfirmation,
    isArchived,
    isSaveDisabled,
    handleSave,
  } = useConfirmArchiveServiceModal({
    open,
    onClose,
    service,
    updateService,
    revalidateTable,
  })

  if (!service || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <DialogHeader trailing={<CloseButton onClick={onClose} />} className="bg-background-danger">
        <DialogTitle className="text-white">
          {isArchived ? "Unarchive" : "Archive"} Service
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="archive-service"
              className="block text-sm font-medium text-typography-primary"
            >
              Type "<span className="text-typography-danger">{service.name}</span>" to confirm{" "}
              {isArchived ? "unarchiving" : "archiving"} this service.
            </label>
            <input
              id="archive-service"
              value={archiveConfirmation}
              onChange={(e) => setArchiveConfirmation(e.target.value)}
              autoComplete="off"
              className="mt-2 block w-full rounded-md border border-border-dark px-2 py-1 text-xs text-typography-primary"
            />
          </div>
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="primary danger"
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>
      </DialogActions>
    </Modal>
  )
}
