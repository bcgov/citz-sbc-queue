import { useEffect, useState } from "react"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type UseConfirmArchiveServiceModalProps = {
  open: boolean
  onClose: () => void
  service: ServiceWithRelations | null
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the ConfirmArchiveServiceModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.service - The service to archive or unarchive.
 * @property props.updateService - Async function to persist the archive/unarchive change.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, and handlers for the modal.
 */
export const useConfirmArchiveServiceModal = ({
  open,
  onClose,
  service,
  updateService,
  revalidateTable,
}: UseConfirmArchiveServiceModalProps) => {
  const [error, setError] = useState<string | null>(null)
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

  const handleSave = async () => {
    if (formData && previousService) {
      try {
        await updateService({ deletedAt: isArchived ? null : new Date() }, previousService)
        await revalidateTable()
        setArchiveConfirmation("")
        onClose()
        window.location.href = "/protected/settings/services"
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("An unknown error occurred")
        }
      }
    }
  }

  const isSaveDisabled = archiveConfirmation !== service?.name

  return {
    error,
    formData,
    archiveConfirmation,
    setArchiveConfirmation,
    isArchived,
    isSaveDisabled,
    handleSave,
  }
}
