"use client"

import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useConfirmDeleteCounterModal } from "@/hooks/settings/counters/useConfirmDeleteCounterModal"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"

type ConfirmDeleteCounterModalProps = {
  open: boolean
  onClose: () => void
  counter: CounterWithRelations | null
  deleteCounter: (id: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const ConfirmDeleteCounterModal = ({
  open,
  onClose,
  counter,
  deleteCounter,
  revalidateTable,
}: ConfirmDeleteCounterModalProps) => {
  const { error, deleteConfirmation, setDeleteConfirmation, isDeleteDisabled, handleDelete } =
    useConfirmDeleteCounterModal({
      open,
      onClose,
      counter,
      deleteCounter,
      revalidateTable,
    })

  if (!counter) return null

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <DialogHeader trailing={<CloseButton onClick={onClose} />} className="bg-background-danger">
        <DialogTitle className="text-white">Delete Counter</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <p className="text-sm text-typography-primary">
            All users assigned to this counter will be set to the default counter.
          </p>

          <div>
            <label
              htmlFor="delete-counter"
              className="block text-sm font-medium text-typography-primary"
            >
              Type "<span className="text-typography-danger">{counter.name}</span>" to confirm
              deleting this counter.
            </label>
            <input
              id="delete-counter"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isDeleteDisabled) handleDelete()
              }}
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
          onClick={handleDelete}
          disabled={isDeleteDisabled}
        >
          Delete
        </button>
      </DialogActions>
    </Modal>
  )
}
