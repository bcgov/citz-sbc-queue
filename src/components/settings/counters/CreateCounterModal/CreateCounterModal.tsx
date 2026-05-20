"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useCreateCounterModal } from "@/hooks/settings/counters/useCreateCounterModal"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { CounterForm } from "../CounterForm"

type CreateCounterModalProps = {
  open: boolean
  onClose: () => void
  locations: LocationWithRelations[]
  staffUsers: StaffUserWithRelations[]
  insertCounter: (counter: Partial<CounterWithRelations>) => Promise<CounterWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const CreateCounterModal = ({
  open,
  onClose,
  locations,
  staffUsers,
  insertCounter,
  revalidateTable,
}: CreateCounterModalProps) => {
  const { isSaving, error, formData, setFormData, isReadonly, isSaveDisabled, handleSave } =
    useCreateCounterModal({
      open,
      onClose,
      insertCounter,
      revalidateTable,
    })

  if (!formData) return null

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Create Counter</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
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
        <button type="button" className="primary" onClick={handleSave} disabled={isSaveDisabled}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
