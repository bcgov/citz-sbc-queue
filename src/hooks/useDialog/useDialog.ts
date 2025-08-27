import { useCallback, useState } from "react"
import type { UseDialogOptions, UseDialogReturn } from "./types"

/**
 * Custom hook to manage dialog state.
 *
 * @param {UseDialogOptions} options - Configuration options for the dialog.
 *
 * @property {boolean} [defaultOpen=false] - Initial open state of the dialog.
 * @property {() => void} [onOpen] - Callback function called when the dialog is opened.
 * @property {() => void} [onClose] - Callback function called when the dialog is closed.
 *
 * @returns Dialog state and control methods.
 */
export const useDialog = ({
  defaultOpen = false,
  onOpen,
  onClose,
}: UseDialogOptions = {}): UseDialogReturn => {
  // React setter (prefixed with `_` to avoid name collision and signal it's internal).
  const [open, _setOpen] = useState<boolean>(defaultOpen)

  // Wrap the React setter to support functional updaters
  // and run onOpen/onClose only when state changes.
  const setOpen = useCallback(
    (next: boolean) => {
      _setOpen((prev) => {
        if (prev === next) return prev
        if (next) onOpen?.()
        if (!next) onClose?.()
        return next
      })
    },
    [onOpen, onClose]
  )

  const openDialog = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const closeDialog = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return { open, setOpen, openDialog, closeDialog }
}
