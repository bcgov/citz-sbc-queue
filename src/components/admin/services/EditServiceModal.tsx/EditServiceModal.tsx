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
import type { Location, Service } from "@/generated/prisma/client"

type EditServiceModalProps = {
  open: boolean
  onClose: () => void
  service: Service | null
  offices: Location[]
  updateService: (
    service: Partial<Service>,
    prevService: Partial<Service>
  ) => Promise<Service | null>
  revalidateTable: () => Promise<void>
}

export const EditServiceModal = ({
  open,
  onClose,
  service,
  offices,
  updateService,
  revalidateTable,
}: EditServiceModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Service | null>(null)
  const [previousService, setPreviousService] = useState<Service | null>(null)

  useEffect(() => {
    if (open && service) {
      setFormData(service)
      setPreviousService(service)
    }
  }, [open, service])

  if (!service || !formData || !previousService) return null

  const isArchived = service.deletedAt !== null
  const isReadonly = isArchived

  const handleSave = async () => {
    if (formData && !isReadonly) {
      setIsSaving(true)
      await updateService(formData, previousService)
      await revalidateTable()
      onClose()
      setIsSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Service: {service.code}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {isReadonly && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              {isArchived && (
                <p className="text-sm font-medium text-red-800">
                  This service is archived and cannot be edited.
                </p>
              )}
            </div>
          )}
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="primary"
          onClick={handleSave}
          disabled={isReadonly || isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
