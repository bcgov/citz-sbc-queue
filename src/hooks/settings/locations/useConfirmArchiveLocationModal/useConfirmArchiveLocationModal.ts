import { useEffect, useState } from "react"
import type { LocationWithRelations } from "@/lib/prisma/location/types"

type UseConfirmArchiveLocationModalProps = {
  open: boolean
  onClose: () => void
  location: LocationWithRelations | null
  updateLocation: (
    location: Partial<LocationWithRelations>,
    prevLocation: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the ConfirmArchiveLocationModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.location - The location to archive or unarchive.
 * @property props.updateLocation - Async function to persist the archive/unarchive change.
 * @property props.revalidateTable - Async function to refresh the locations table.
 * @returns State, derived flags, and handlers for the modal.
 */
export const useConfirmArchiveLocationModal = ({
  open,
  onClose,
  location,
  updateLocation,
  revalidateTable,
}: UseConfirmArchiveLocationModalProps) => {
  const [error, setError] = useState<string | null>(null)
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

  const handleSave = async () => {
    try {
      if (formData && previousLocation) {
        await updateLocation({ deletedAt: isArchived ? null : new Date() }, previousLocation)
        await revalidateTable()
        setArchiveConfirmation("")
        onClose()
        window.location.href = "/protected/settings/locations"
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  const isConfirmDisabled = archiveConfirmation !== location?.name

  return {
    error,
    formData,
    archiveConfirmation,
    setArchiveConfirmation,
    isArchived,
    isConfirmDisabled,
    handleSave,
  }
}
