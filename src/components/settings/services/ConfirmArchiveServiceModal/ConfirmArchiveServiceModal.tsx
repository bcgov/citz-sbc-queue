"use client"

import { useEffect, useState } from "react"
import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
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
  const [formData, setFormData] = useState<ServiceWithRelations | null>(null)
  const [previousService, setPreviousService] = useState<ServiceWithRelations | null>(null)
  const [archiveConfirmation, setArchiveConfirmation] = useState("")

  const isArchived = service?.deletedAt !== null

  useEffect(() => {
    if (open && service) {
      setFormData(service)
      setPreviousService(service)
    }
  }, [open, service])

  if (!service || !formData || !previousService) return null

  const handleSave = async () => {
    if (formData) {
      await updateService(
        { ...formData, deletedAt: isArchived ? null : new Date() },
        previousService
      )
      await revalidateTable()
      setArchiveConfirmation("")
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <DialogHeader trailing={<CloseButton onClick={onClose} />} className="bg-background-danger">
        <DialogTitle className="text-white">
          {isArchived ? "Unarchive" : "Archive"} Service
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
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
          disabled={archiveConfirmation !== service.name}
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>
      </DialogActions>
    </Modal>
  )
}
