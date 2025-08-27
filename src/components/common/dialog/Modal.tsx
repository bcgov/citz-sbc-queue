"use client"

import { Dialog as HeadlessDialog, Transition, TransitionChild } from "@headlessui/react"
import type { ReactNode, RefObject } from "react"
import { Fragment, useId, useMemo } from "react"
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
}: ModalProps) => {
  const internalId = useId() // Unique ID for the modal
  const labelledBy = labelledById ?? `${internalId}-title`
  const describedBy = describedById ?? `${internalId}-description`

  const modalClasses = useMemo(() => {
    return `relative bg-white rounded-[4px] ${DIALOG_SIZE_CLASSES[size]} z-50 ${className ?? ""}`
  }, [size, className])

  const modalPanelClasses = useMemo(() => {
    return [
      "w-full z-60",
      DIALOG_SIZE_CLASSES[size],
      "transform overflow-hidden bg-white rounded-[4px]",
      "focus:outline-none",
      "data-[closed]:scale-95 data-[closed]:opacity-0",
      "data-[enter]:duration-150 data-[leave]:duration-100",
      panelClassName ?? "",
    ].join(" ")
  }, [size, panelClassName])

  const modalOverlayClasses = useMemo(() => {
    return [
      "fixed inset-0 bg-black/50 z-40 pointer-events-none data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100",
      overlayClassName ?? "",
    ].join(" ")
  }, [overlayClassName])

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
          className={modalClasses}
          open={open}
          onClose={onClose}
          initialFocus={initialFocusRef}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div aria-hidden className={modalOverlayClasses} />
            <div className={modalPanelClasses} role="document">
              {children}
            </div>
          </div>
        </HeadlessDialog>
      </DialogContext.Provider>
    )
  }

  return (
    <DialogContext.Provider value={dialogContextValue}>
      <Transition show={open} as={Fragment} appear>
        <HeadlessDialog
          as="div"
          className={modalClasses}
          open={open}
          onClose={onClose}
          initialFocus={initialFocusRef}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild as={Fragment}>
              <div aria-hidden className={modalOverlayClasses} />
            </TransitionChild>

            <TransitionChild as={Fragment}>
              <div className={modalPanelClasses} role="document">
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
