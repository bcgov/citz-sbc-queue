"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useConfirmArchiveLocationModal } from "@/hooks/settings/locations/useConfirmArchiveLocationModal"
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
  const {
    error,
    formData,
    archiveConfirmation,
    setArchiveConfirmation,
    isArchived,
    isConfirmDisabled,
    handleSave,
  } = useConfirmArchiveLocationModal({ open, onClose, location, updateLocation, revalidateTable })

  if (!location || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <DialogHeader trailing={<CloseButton onClick={onClose} />} className="bg-background-danger">
        <DialogTitle className="text-white">
          {isArchived ? "Unarchive" : "Archive"} Location
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isConfirmDisabled) handleSave()
              }}
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
          disabled={isConfirmDisabled}
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>
      </DialogActions>
    </Modal>
  )
}
