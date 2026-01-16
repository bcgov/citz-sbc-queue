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
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { useEditableRoles } from "@/hooks/useEditableRoles"
import { PermissionsSection } from "./sections/PermissionsSection"
import { RoleAndAssignmentSection } from "./sections/RoleAndAssignmentSection"
import { UserInformationSection } from "./sections/UserInformationSection"

type EditStaffUserModalProps = {
  open: boolean
  onClose: () => void
  user: StaffUser | null
  offices: Location[]
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles: Role[]
  ) => Promise<StaffUser | null>
  revalidateTable: () => Promise<void>
  openConfirmArchiveUserModal: () => void
}

export const EditStaffUserModal = ({
  open,
  onClose,
  user,
  offices,
  updateStaffUser,
  revalidateTable,
  openConfirmArchiveUserModal,
}: EditStaffUserModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<StaffUser | null>(null)
  const [previousUser, setPreviousUser] = useState<StaffUser | null>(null)
  const editableRoles = useEditableRoles()

  useEffect(() => {
    if (open && user) {
      setFormData(user)
      setPreviousUser(user)
    }
  }, [open, user])

  if (!user || !formData || !previousUser) return null

  // Check if the user being edited has a higher role than the current user
  const isUserHigherRole = !editableRoles.includes(user.role)
  const isArchived = user.deletedAt !== null
  const isReadonly = isUserHigherRole || isArchived

  const handleSave = async () => {
    if (formData && !isReadonly) {
      setIsSaving(true)
      await updateStaffUser(formData, previousUser, editableRoles)
      await revalidateTable()
      onClose()
      setIsSaving(false)
    }
  }

  const handleOpenArchive = () => {
    openConfirmArchiveUserModal()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit User: {user.username}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {isReadonly && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              {isUserHigherRole && (
                <p className="text-sm font-medium text-red-800">
                  This user has a higher role than yours and cannot be edited.
                </p>
              )}
              {isArchived && (
                <p className="text-sm font-medium text-red-800">
                  This user is archived and cannot be edited.
                </p>
              )}
            </div>
          )}

          <UserInformationSection user={user} />

          <div className="grid grid-cols-2 gap-6">
            <RoleAndAssignmentSection
              user={formData}
              offices={offices}
              setFormData={setFormData}
              availableRoles={editableRoles}
              disabled={isReadonly}
            />
            <PermissionsSection user={formData} setFormData={setFormData} disabled={isReadonly} />
          </div>
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="secondary danger"
          onClick={handleOpenArchive}
          disabled={isReadonly && !isArchived}
        >
          {isArchived ? "Unarchive" : "Archive"}
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
