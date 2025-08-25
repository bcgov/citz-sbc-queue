"use client"

import { useRef } from "react"
import {
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { useDialog } from "@/hooks/useDialog/useDialog"

export const Example = () => {
  const { open, openDialog, closeDialog } = useDialog()
  const focusRef = useRef<HTMLButtonElement | null>(null)

  return (
    <div className="p-6">
      <button type="button" className="primary" onClick={openDialog}>
        Open modal
      </button>

      <Modal open={open} onClose={closeDialog} size="md" initialFocusRef={focusRef}>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>This will perform a sensitive operation. Continue?</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <p className="text-sm text-gray-700">
            Body content goes here. It can scroll if it gets long.
          </p>
        </DialogBody>

        <DialogActions>
          <button type="button" className="tertiary" onClick={closeDialog}>
            Cancel
          </button>
          <button ref={focusRef} type="button" className="primary" onClick={closeDialog}>
            Confirm
          </button>
        </DialogActions>
      </Modal>
    </div>
  )
}
