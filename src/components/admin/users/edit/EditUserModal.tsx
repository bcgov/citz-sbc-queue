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
import { PermissionsSection } from "./PermissionsSection"
import { RoleAndAssignmentSection } from "./RoleAndAssignmentSection"
import { UserInformationSection } from "./UserInformationSection"
import { useEditUserAvailableRoles } from "./useEditUserAvailableRoles"

type EditUserModalProps = {
  open: boolean
  onClose: () => void
  user: StaffUser | null
  updateUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles: Role[]
  ) => Promise<void>
}

export const EditUserModal = ({ open, onClose, user, updateUser }: EditUserModalProps) => {
  const [formData, setFormData] = useState<StaffUser | null>(null)
  const [previousUser, setPreviousUser] = useState<StaffUser | null>(null)
  const availableRoles = useEditUserAvailableRoles()

  useEffect(() => {
    if (open && user) {
      setFormData(user)
      setPreviousUser(user)
    }
  }, [open, user])

  const handleChange = (field: keyof StaffUser, value: StaffUser[keyof StaffUser]) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  if (!user || !formData || !previousUser) return null

  const handleSave = async () => {
    if (formData) {
      await updateUser(formData, previousUser, availableRoles)
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
          <UserInformationSection user={user} />

          <div className="grid grid-cols-2 gap-6">
            <RoleAndAssignmentSection
              user={formData}
              onRoleChange={(role) => handleChange("role", role)}
              onOfficeIdChange={(officeId) => handleChange("officeId", officeId)}
              availableRoles={availableRoles}
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
            />
          </div>
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="primary" onClick={handleSave}>
          Save Changes
        </button>
      </DialogActions>
    </Modal>
  )
}
