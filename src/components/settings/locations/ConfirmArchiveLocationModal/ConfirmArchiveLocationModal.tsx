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
import type { LocationWithRelations } from "@/lib/prisma/location/types"

type ConfirmArchiveLocationModalProps = {
  open: boolean
  onClose: () => void
  location: LocationWithRelations | null
  updateLocation: (
    location: Partial<LocationWithRelations>,
    prevLocation: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const ConfirmArchiveLocationModal = ({
  open,
  onClose,
  location,
  updateLocation,
  revalidateTable,
}: ConfirmArchiveLocationModalProps) => {
  const [formData, setFormData] = useState<LocationWithRelations | null>(null)
  const [previousLocation, setPreviousLocation] = useState<LocationWithRelations | null>(null)
  const [archiveConfirmation, setArchiveConfirmation] = useState("")

  const isArchived = location?.deletedAt !== null

  useEffect(() => {
    if (open && location) {
      setFormData(location)
      setPreviousLocation(location)
    }
  }, [open, location])

  if (!location || !formData || !previousLocation) return null

  const handleSave = async () => {
    if (formData) {
      await updateLocation(
        { ...formData, deletedAt: isArchived ? null : new Date() },
        previousLocation
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
          {isArchived ? "Unarchive" : "Archive"} Location
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          <div>
            <label
              htmlFor="archive-location"
              className="block text-sm font-medium text-typography-primary"
            >
              Type "<span className="text-typography-danger">{location.name}</span>" to confirm{" "}
              {isArchived ? "unarchiving" : "archiving"} this location.
            </label>
            <input
              id="archive-location"
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
          disabled={archiveConfirmation !== location.name}
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>
      </DialogActions>
    </Modal>
  )
}
