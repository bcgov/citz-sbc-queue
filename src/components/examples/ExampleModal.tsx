"use client"

import {
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useDialog } from "@/hooks/useDialog/useDialog"
import CloseButton from "@/components/common/dialog/CloseButton"

export const ExampleModal = () => {
  const { open, openDialog, closeDialog } = useDialog()

  return (
    <div className="p-6">
      <button type="button" className="secondary" onClick={openDialog}>
        Open modal
      </button>

      <Modal open={open} onClose={closeDialog} size="md">
        <DialogHeader trailing={<CloseButton onClick={closeDialog} />}>
          <DialogTitle>Confirm action</DialogTitle>
        </DialogHeader>

        <DialogBody>
          Are you sure you want to proceed with this action? This change cannot be undone. Please
          review the details before confirming
        </DialogBody>

        <DialogActions>
          <button type="button" className="tertiary" onClick={closeDialog}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={closeDialog}>
            Confirm
          </button>
        </DialogActions>
      </Modal>
    </div>
  )
}
