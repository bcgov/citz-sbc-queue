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
}

export const EditStaffUserModal = ({
  open,
  onClose,
  user,
  offices,
  updateStaffUser,
  revalidateTable,
}: EditStaffUserModalProps) => {
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
  const isReadonly = isUserHigherRole

  const handleChange = (field: keyof StaffUser, value: StaffUser[keyof StaffUser]) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSave = async () => {
    if (formData && !isReadonly) {
      await updateStaffUser(formData, previousUser, editableRoles)
      await revalidateTable()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit User: {user.username}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {isReadonly && (
            <div className="rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                This user has a higher role than yours and cannot be edited.
              </p>
            </div>
          )}

          <UserInformationSection user={user} />

          <div className="grid grid-cols-2 gap-6">
            <RoleAndAssignmentSection
              user={formData}
              offices={offices}
              onRoleChange={(role) => handleChange("role", role)}
              onLocationIdChange={(locationId) => handleChange("locationId", locationId)}
              availableRoles={editableRoles}
              disabled={isReadonly}
            />
            <PermissionsSection
              user={formData}
              onIsReceptionistChange={(isReceptionist) =>
                handleChange("isReceptionist", isReceptionist)
              }
              onIsOfficeManagerChange={(isOfficeManager) =>
                handleChange("isOfficeManager", isOfficeManager)
              }
              onIsPesticideDesignateChange={(isPesticideDesignate) =>
                handleChange("isPesticideDesignate", isPesticideDesignate)
              }
              onIsFinanceDesignateChange={(isFinanceDesignate) =>
                handleChange("isFinanceDesignate", isFinanceDesignate)
              }
              onIsIta2DesignateChange={(isIta2Designate) =>
                handleChange("isIta2Designate", isIta2Designate)
              }
              disabled={isReadonly}
            />
          </div>
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="primary" onClick={handleSave} disabled={isReadonly}>
          Save Changes
        </button>
      </DialogActions>
    </Modal>
  )
}
