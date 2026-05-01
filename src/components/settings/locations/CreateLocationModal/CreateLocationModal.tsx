"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import { useCreateLocationModal } from "@/hooks/settings/locations/useCreateLocationModal"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { LocationForm } from "../LocationForm"

type CreateLocationModalProps = {
  open: boolean
  onClose: () => void
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  insertLocation: (
    location: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  doesLocationCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const CreateLocationModal = ({
  open,
  onClose,
  services,
  counters,
  staffUsers,
  insertLocation,
  doesLocationCodeExist,
  revalidateTable,
}: CreateLocationModalProps) => {
  const { isSaving, error, formData, setFormData, isReadonly, isSaveDisabled, handleSave } =
    useCreateLocationModal({
      open,
      onClose,
      services,
      counters,
      staffUsers,
      insertLocation,
      doesLocationCodeExist,
      revalidateTable,
    })

  if (!formData) return null

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Create Location</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <LocationForm
            location={formData}
            services={services}
            counters={counters}
            staffUsers={staffUsers}
            setFormData={setFormData}
            doesLocationCodeExist={doesLocationCodeExist}
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
