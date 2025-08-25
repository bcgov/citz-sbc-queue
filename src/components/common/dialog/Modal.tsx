"use client"

import { TransitionChild } from "@headlessui/react"
import type { ReactNode } from "react"
import { Fragment, useMemo } from "react"
import { MODAL_SIZE_CLASSES } from "./constants"
import { Dialog } from "./Dialog"
import type { ModalSize } from "./types"

export type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  className?: string
  panelClassName?: string
  overlayClassName?: string
  withTransition?: boolean
  initialFocusRef?: React.RefObject<HTMLElement | null>
  labelledById?: string
  describedById?: string
}

/**
 * Modal component for displaying a modal dialog.
 * @param {ModalProps} props - Props for the modal component.
 */
export const Modal = ({
  open,
  onClose,
  children,
  size = "md",
  className,
  panelClassName,
  overlayClassName,
  withTransition = true,
  initialFocusRef,
  labelledById,
  describedById,
}: ModalProps) => {
  const panelClasses = useMemo(() => {
    return [
      "w-full",
      MODAL_SIZE_CLASSES[size],
      "transform overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/10",
      "focus:outline-none",
      "data-[closed]:scale-95 data-[closed]:opacity-0",
      "data-[enter]:duration-150 data-[leave]:duration-100",
      `${panelClassName ?? ""}`,
    ].join(" ")
  }, [size, panelClassName])

  const overlayClasses = useMemo(() => {
    return [
      "fixed inset-0 bg-black/50 z-40 pointer-events-none data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100",
      `${overlayClassName ?? ""}`,
    ].join(" ")
  }, [overlayClassName])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={className}
      withTransition={withTransition}
      initialFocusRef={initialFocusRef}
      labelledById={labelledById}
      describedById={describedById}
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild as={Fragment}>
          <div aria-hidden className={overlayClasses} />
        </TransitionChild>

        <TransitionChild as={Fragment}>
          <div className={panelClasses} role="document">
            {children}
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  )
}

export default Modal
