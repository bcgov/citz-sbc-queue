"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { useConfirmArchiveUserModal } from "@/hooks/settings/users/useConfirmArchiveUserModal"

type ConfirmArchiveUserModalProps = {
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

export const ConfirmArchiveUserModal = ({
  open,
  onClose,
  user,
  updateStaffUser,
  revalidateTable,
}: ConfirmArchiveUserModalProps) => {
  const {
    error,
    formData,
    archiveConfirmation,
    setArchiveConfirmation,
    isArchived,
    isSaveDisabled,
    handleSave,
  } = useConfirmArchiveUserModal({
    open,
    onClose,
    user,
    updateStaffUser,
    revalidateTable,
  })

  if (!user || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <DialogHeader trailing={<CloseButton onClick={onClose} />} className="bg-background-danger">
        <DialogTitle className="text-white">
          {isArchived ? "Unarchive" : "Archive"} User
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
              htmlFor="archive-user"
              className="block text-sm font-medium text-typography-primary"
            >
              Type "<span className="text-typography-danger">{user.username}</span>" to confirm{" "}
              {isArchived ? "unarchiving" : "archiving"} this user.
            </label>
            <input
              id="archive-user"
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
