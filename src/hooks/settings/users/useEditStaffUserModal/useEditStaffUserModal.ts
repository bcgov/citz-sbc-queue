import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Role } from "@/generated/prisma/client"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"

type UseEditStaffUserModalProps = {
  open: boolean
  onClose: () => void
  user: StaffUserWithRelations | null
  canEdit: boolean
  canArchive: boolean
  updateStaffUser: (
    user: Partial<StaffUserWithRelations>,
    prevUser: Partial<StaffUserWithRelations>,
    availableRoles: Role[]
  ) => Promise<StaffUserWithRelations | null>
  availableRoles: Role[]
  revalidateTable: () => Promise<void>
  openConfirmArchiveUserModal: () => void
}

/**
 * Custom hook encapsulating all logic for the EditStaffUserModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.user - The staff user being edited.
 * @property props.canEdit - Whether the current user can edit this staff user.
 * @property props.canArchive - Whether the current user can archive this staff user.
 * @property props.updateStaffUser - Async function to persist changes.
 * @property props.availableRoles - Roles the current user can assign to this staff user.
 * @property props.revalidateTable - Async function to refresh the table.
 * @property props.openConfirmArchiveUserModal - Callback to open the archive confirmation modal.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useEditStaffUserModal = ({
  open,
  onClose,
  user,
  canEdit,
  availableRoles,
  updateStaffUser,
  revalidateTable,
  openConfirmArchiveUserModal,
}: UseEditStaffUserModalProps) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffUserWithRelations | null>(null)
  const [previousUser, setPreviousUser] = useState<StaffUserWithRelations | null>(null)

  useEffect(() => {
    if (open && user) {
      setFormData(user)
      setPreviousUser(user)
    }
  }, [open, user])

  const isArchived = user?.deletedAt !== null
  const isReadonly = (isArchived ?? false) || !canEdit

  const hasMadeChanges = JSON.stringify(formData) !== JSON.stringify(previousUser)

  const handleSave = async () => {
    if (formData && previousUser && !isReadonly) {
      try {
        setIsSaving(true)
        await updateStaffUser(formData, previousUser, availableRoles)
        await revalidateTable()
        onClose()
        setIsSaving(false)
        router.refresh()
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("An unknown error occurred")
        }
        setIsSaving(false)
      }
    }
  }

  const handleOpenArchive = () => {
    openConfirmArchiveUserModal()
    onClose()
  }

  const isSaveDisabled = isReadonly || isSaving || !hasMadeChanges

  return {
    isSaving,
    error,
    formData,
    setFormData,
    isArchived,
    isReadonly,
    hasMadeChanges,
    isSaveDisabled,
    handleSave,
    handleOpenArchive,
  }
}
