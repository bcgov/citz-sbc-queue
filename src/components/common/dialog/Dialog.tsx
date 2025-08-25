"use client"

import { Dialog as HeadlessDialog, Transition } from "@headlessui/react"
import type { ReactNode, RefObject } from "react"
import { Fragment, useId, useMemo } from "react"

export type DialogProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  className?: string
  withTransition?: boolean
  labelledById?: string
  describedById?: string
}

/**
 * Dialog component with BC Gov styling.
 * @param {DialogProps} props - Props for the dialog component.
 */
export const Dialog = ({
  open,
  onClose,
  children,
  initialFocusRef,
  className,
  withTransition = true,
  labelledById,
  describedById,
}: DialogProps) => {
  const internalId = useId() // Unique id for the dialog
  const labelledBy = labelledById ?? `${internalId}-title`
  const describedBy = describedById ?? `${internalId}-description`

  const dialogClasses = useMemo(() => {
    return `relative z-50 bg-white rounded-[4px] ${className ?? ""}`
  }, [className])

  const dialogContent = (
    <HeadlessDialog
      as="div"
      className={dialogClasses}
      open={open}
      onClose={onClose}
      initialFocus={initialFocusRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      {children}
    </HeadlessDialog>
  )

  if (!withTransition) {
    return dialogContent
  }

  return (
    <Transition show={open} as={Fragment} appear>
      {dialogContent}
    </Transition>
  )
}

export default Dialog
