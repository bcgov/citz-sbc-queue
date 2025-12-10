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
import type { Role, StaffUser } from "@/generated/prisma/client"
import { useEditableRoles } from "@/hooks/useEditableRoles"

type ConfirmArchiveModalProps = {
  open: boolean
  onClose: () => void
  user: StaffUser | null
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles: Role[]
  ) => Promise<StaffUser | null>
  revalidateTable: () => Promise<void>
}

export const ConfirmArchiveModal = ({
  open,
  onClose,
  user,
  updateStaffUser,
  revalidateTable,
}: ConfirmArchiveModalProps) => {
  const [formData, setFormData] = useState<StaffUser | null>(null)
  const [previousUser, setPreviousUser] = useState<StaffUser | null>(null)
  const [archiveConfirmation, setArchiveConfirmation] = useState("")
  const editableRoles = useEditableRoles()

  const isArchived = user?.deletedAt !== null

  useEffect(() => {
    if (open && user) {
      setFormData(user)
      setPreviousUser(user)
    }
  }, [open, user])

  if (!user || !formData || !previousUser) return null

  const handleSave = async () => {
    if (formData) {
      await updateStaffUser(
        { ...formData, deletedAt: isArchived ? null : new Date() },
        previousUser,
        editableRoles
      )
      await revalidateTable()
      setArchiveConfirmation("")
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>
          {isArchived ? "Unarchive" : "Archive"} User: {user.username}
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          <div>
            <label
              htmlFor="archive-user"
              className="block text-sm font-medium text-typography-primary"
            >
              Type "{user.username}" to confirm {isArchived ? "unarchiving" : "archiving"} this
              user.
            </label>
            <input
              id="archive-user"
              value={archiveConfirmation}
              onChange={(e) => setArchiveConfirmation(e.target.value)}
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
          disabled={archiveConfirmation !== user.username}
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>
      </DialogActions>
    </Modal>
  )
}
