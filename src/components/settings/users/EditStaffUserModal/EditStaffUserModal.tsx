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
import { PermissionsSection } from "./sections/PermissionsSection"
import { RoleAndAssignmentSection } from "./sections/RoleAndAssignmentSection"
import { UserInformationSection } from "./sections/UserInformationSection"

type EditStaffUserModalProps = {
  open: boolean
  onClose: () => void
  user: StaffUser | null
  canEdit: boolean
  canArchive: boolean
  availableRoles: Role[]
  locations: Location[]
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
  canEdit,
  canArchive,
  locations,
  availableRoles,
  updateStaffUser,
  revalidateTable,
  openConfirmArchiveUserModal,
}: EditStaffUserModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffUser | null>(null)
  const [previousUser, setPreviousUser] = useState<StaffUser | null>(null)

  useEffect(() => {
    if (open && user) {
      setFormData(user)
      setPreviousUser(user)
    }
  }, [open, user])

  if (!user || !formData || !previousUser) return null

  const isArchived = user.deletedAt !== null
  const isReadonly = isArchived || !canEdit

  const hasMadeChanges = JSON.stringify(formData) !== JSON.stringify(previousUser)

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await updateStaffUser(formData, previousUser, availableRoles)
        await revalidateTable()
        onClose()
        setIsSaving(false)
        window.location.href = "/protected/settings/users" // Force re-fetch
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

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit User: {user.username}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {isReadonly && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              {isArchived && (
                <p className="text-sm font-medium text-red-800">
                  This user is archived and cannot be edited.
                </p>
              )}
              {!canEdit && (
                <p className="text-sm font-medium text-red-800">
                  You do not have permission to edit this user.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <UserInformationSection user={user} />

          <div className="grid grid-cols-2 gap-6">
            <RoleAndAssignmentSection
              user={formData}
              locations={locations}
              setFormData={setFormData}
              availableRoles={availableRoles}
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
        {canArchive && (
          <button type="button" className="secondary danger" onClick={handleOpenArchive}>
            {isArchived ? "Unarchive" : "Archive"}
          </button>
        )}
        <button
          type="button"
          className="primary"
          onClick={handleSave}
          disabled={isReadonly || isSaving || !hasMadeChanges}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
