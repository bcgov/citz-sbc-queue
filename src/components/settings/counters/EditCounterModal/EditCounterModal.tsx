"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useEditCounterModal } from "@/hooks/settings/counters/useEditCounterModal"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { CounterForm } from "../CounterForm"

type EditCounterModalProps = {
  open: boolean
  onClose: () => void
  counter: CounterWithRelations | null
  locations: LocationWithRelations[]
  staffUsers: StaffUserWithRelations[]
  canEdit: boolean
  canDelete: boolean
  updateCounter: (
    counter: Partial<CounterWithRelations>,
    prevCounter: Partial<CounterWithRelations>
  ) => Promise<CounterWithRelations | null>
  revalidateTable: () => Promise<void>
  openConfirmDeleteCounterModal: () => void
}

export const EditCounterModal = ({
  open,
  onClose,
  counter,
  locations,
  staffUsers,
  canEdit,
  canDelete,
  updateCounter,
  revalidateTable,
  openConfirmDeleteCounterModal,
}: EditCounterModalProps) => {
  const {
    isSaving,
    error,
    formData,
    setFormData,
    isReadonly,
    isSaveDisabled,
    handleSave,
    handleOpenDelete,
  } = useEditCounterModal({
    open,
    onClose,
    counter,
    canEdit,
    canDelete,
    updateCounter,
    revalidateTable,
    openConfirmDeleteCounterModal,
  })

  if (!counter || !formData) return null

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Counter: {counter.name}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {!canEdit && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                {counter.name === "Counter"
                  ? "The default counter cannot be edited."
                  : "You do not have permission to edit this counter."}
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <CounterForm
            counter={formData}
            locations={locations}
            staffUsers={staffUsers}
            setFormData={setFormData}
            isReadonly={isReadonly}
          />
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        {canDelete && (
          <button type="button" className="secondary danger" onClick={handleOpenDelete}>
            Delete
          </button>
        )}
        <button type="button" className="primary" onClick={handleSave} disabled={isSaveDisabled}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
