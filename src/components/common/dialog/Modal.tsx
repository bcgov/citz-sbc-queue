"use client"

import { Dialog as HeadlessDialog, Transition, TransitionChild } from "@headlessui/react"
import type { ReactNode, RefObject } from "react"
import { Fragment, useEffect, useId, useMemo } from "react"
import { DIALOG_SIZE_CLASSES } from "./constants"
import { DialogContext } from "./DialogContext"
import type { DialogSize } from "./types"

export type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  className?: string
  size?: DialogSize
  withTransition?: boolean
  labelledById?: string
  describedById?: string
  panelClassName?: string
  overlayClassName?: string
  disableEscapeKeyClose?: boolean
}

/**
 * Modal component with BC Gov styling.
 * Creates a centered modal dialog with backdrop overlay.
 *
 * @param {ModalProps} props - Props for the modal component.
 *
 * @property {boolean} open - Whether the modal is open and visible.
 * @property {() => void} onClose - Function called when the modal should be closed.
 * @property {ReactNode} children - The content to render inside the modal.
 * @property {RefObject<HTMLElement | null>} [initialFocusRef] - Ref to the element that should receive focus when the modal opens.
 * @property {string} [className] - Additional CSS classes to apply to the modal container.
 * @property {DialogSize} [size="md"] - Size of the modal. Options: "sm", "md", "lg", "xl".
 * @property {boolean} [withTransition=true] - Whether to animate the modal open/close with transitions.
 * @property {string} [labelledById] - ID of the element that labels the modal for accessibility. Auto-generated if not provided.
 * @property {string} [describedById] - ID of the element that describes the modal for accessibility. Auto-generated if not provided.
 * @property {string} [panelClassName] - Additional CSS classes to apply to the modal content panel.
 * @property {string} [overlayClassName] - Additional CSS classes to apply to the modal backdrop overlay.
 * @property {boolean} [disableEscapeKeyClose=false] - When true, pressing the Escape key will not close the modal, forcing the user to make a decision within the modal.
 *
 * @example
 * const { open, openDialog, closeDialog } = useDialog()
 *
 * return (
 *   <div className="p-6">
 *     <button type="button" onClick={openDialog}>
 *       Open modal
 *     </button>
 *
 *     <Modal open={open} onClose={closeDialog}>
 *       {Dialog components}
 *     </Modal>
 *   </div>
 * )
 */
export const Modal = ({
  open,
  onClose,
  children,
  initialFocusRef,
  className,
  size = "md",
  withTransition = true,
  labelledById,
  describedById,
  panelClassName,
  overlayClassName,
  disableEscapeKeyClose = false,
}: ModalProps) => {
  const internalId = useId() // Unique ID for the modal
  const labelledBy = labelledById ?? `${internalId}-title`
  const describedBy = describedById ?? `${internalId}-description`

  // Handle escape key press when disableEscapeKeyClose is true
  useEffect(() => {
    if (!disableEscapeKeyClose || !open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [disableEscapeKeyClose, open])

  const dialogContextValue = useMemo(
    () => ({
      titleId: labelledBy,
      descriptionId: describedBy,
    }),
    [labelledBy, describedBy]
  )

  if (!withTransition) {
    return (
      <DialogContext.Provider value={dialogContextValue}>
        <HeadlessDialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          open={open}
          onClose={onClose}
          initialFocus={initialFocusRef}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          <div
            className={`fixed inset-0 bg-black/50 ${overlayClassName ?? ""}`}
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div
              className={`relative w-full transform overflow-hidden bg-white rounded-[4px] shadow-lg focus:outline-none ${DIALOG_SIZE_CLASSES[size]} ${panelClassName ?? ""} ${className ?? ""}`}
              role="document"
            >
              {children}
            </div>
          </div>
        </HeadlessDialog>
      </DialogContext.Provider>
    )
  }

  return (
    <DialogContext.Provider value={dialogContextValue}>
      <Transition show={open} as={Fragment}>
        <HeadlessDialog
          as="div"
          className="relative z-50"
          onClose={onClose}
          initialFocus={initialFocusRef}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={`fixed inset-0 bg-black/50 ${overlayClassName ?? ""}`}
              aria-hidden="true"
            />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                className={`relative w-full transform overflow-hidden bg-white rounded-[4px] shadow-lg focus:outline-none ${DIALOG_SIZE_CLASSES[size]} ${panelClassName ?? ""} ${className ?? ""}`}
                role="document"
              >
                {children}
              </div>
            </TransitionChild>
          </div>
        </HeadlessDialog>
      </Transition>
    </DialogContext.Provider>
  )
}

export default Modal
