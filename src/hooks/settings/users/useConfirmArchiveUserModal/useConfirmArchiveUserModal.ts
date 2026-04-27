import { useEffect, useState } from "react"
import type { Role, StaffUser } from "@/generated/prisma/client"

type UseConfirmArchiveUserModalProps = {
  open: boolean
  onClose: () => void
  user: StaffUser | null
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles?: Role[]
  ) => Promise<StaffUser | null>
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the ConfirmArchiveUserModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.user - The staff user to archive or unarchive.
 * @property props.updateStaffUser - Async function to persist the archive/unarchive change.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, and handlers for the modal.
 */
export const useConfirmArchiveUserModal = ({
  open,
  onClose,
  user,
  updateStaffUser,
  revalidateTable,
}: UseConfirmArchiveUserModalProps) => {
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffUser | null>(null)
  const [previousUser, setPreviousUser] = useState<StaffUser | null>(null)
  const [archiveConfirmation, setArchiveConfirmation] = useState("")

  const isArchived = user?.deletedAt !== null

  useEffect(() => {
    if (open && user) {
      setFormData(user)
      setPreviousUser(user)
    }
  }, [open, user])

  const handleSave = async () => {
    if (formData && previousUser) {
      try {
        await updateStaffUser({ deletedAt: isArchived ? null : new Date() }, previousUser)
        await revalidateTable()
        setArchiveConfirmation("")
        onClose()
        window.location.href = "/protected/settings/users"
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("An unknown error occurred.")
        }
      }
    }
  }

  const isSaveDisabled = archiveConfirmation !== user?.username

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
