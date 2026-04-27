"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { useEditStaffUserModal } from "@/hooks/settings/users/useEditStaffUserModal"
import { PermissionsSection } from "./sections/PermissionsSection"
import { RoleAndAssignmentSection } from "./sections/RoleAndAssignmentSection"
import { UserInformationSection } from "./sections/UserInformationSection"

type EditStaffUserModalProps = {
  open: boolean
  onClose: () => void
  user: StaffUser | null
  canEdit: boolean
  canArchive: boolean
  canEditLocation: boolean
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
  canEditLocation,
  locations,
  availableRoles,
  updateStaffUser,
  revalidateTable,
  openConfirmArchiveUserModal,
}: EditStaffUserModalProps) => {
  const {
    isSaving,
    error,
    formData,
    setFormData,
    isArchived,
    isReadonly,
    isSaveDisabled,
    handleSave,
    handleOpenArchive,
  } = useEditStaffUserModal({
    open,
    onClose,
    user,
    canEdit,
    canArchive,
    availableRoles,
    updateStaffUser,
    revalidateTable,
    openConfirmArchiveUserModal,
  })

  if (!user || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit User: {user.username}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {!canEdit && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                You do not have permission to edit this user.
              </p>
            </div>
          )}

          {isArchived && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                This user is archived and cannot be edited.
              </p>
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
              canEditLocation={canEditLocation}
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
        <button type="button" className="primary" onClick={handleSave} disabled={isSaveDisabled}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
