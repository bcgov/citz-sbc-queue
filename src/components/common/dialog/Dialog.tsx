"use client"

import type { ReactNode } from "react"
import { useId, useMemo } from "react"
import { createPortal } from "react-dom"
import { DIALOG_POSITION_CLASSES, DIALOG_SIZE_CLASSES } from "./constants"
import { DialogContext } from "./DialogContext"
import type { DialogOffset, DialogPosition, DialogSize } from "./types"

export type DialogProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  size?: DialogSize
  labelledById?: string
  describedById?: string
  position?: DialogPosition
  offset?: DialogOffset
}

/**
 * Dialog component with BC Gov styling.
 * A standalone dialog component for non-modal dialogs that can be positioned on the page.
 *
 * @param {DialogProps} props - Props for the dialog component.
 *
 * @property {boolean} open - Whether the dialog is open and visible.
 * @property {() => void} onClose - Function called when the dialog should be closed (e.g., on Escape key).
 * @property {ReactNode} children - The content to render inside the dialog.
 * @property {string} [className] - Additional CSS classes to apply to the dialog container.
 * @property {DialogSize} [size="md"] - Size of the dialog. Options: "sm", "md", "lg", "xl".
 * @property {string} [labelledById] - ID of the element that labels the dialog for accessibility. Auto-generated if not provided.
 * @property {string} [describedById] - ID of the element that describes the dialog for accessibility. Auto-generated if not provided.
 * @property {DialogPosition} [position="relative"] - Position of the dialog on the page. Options include "top-left", "top-right", "center", etc.
 * @property {DialogOffset} [offset] - Pixel offset to adjust dialog position. Object with optional x and y number properties.
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
 *     <Dialog
 *       open={open}
 *       onClose={closeDialog}
 *       size="md"
 *       position="top-right"
 *       offset={{ x: -20, y: 20 }}
 *     >
 *       {Dialog components}
 *     </Dialog>
 *   </div>
 * )
 */
export const Dialog = ({
  open,
  onClose,
  children,
  className,
  size = "md",
  labelledById,
  describedById,
  position = "relative",
  offset,
}: DialogProps) => {
  const internalId = useId() // Unique ID for the dialog
  const labelledBy = labelledById ?? `${internalId}-title`
  const describedBy = describedById ?? `${internalId}-description`

  const dialogClasses = useMemo(() => {
    const baseClasses = `bg-white rounded-[4px] ${DIALOG_SIZE_CLASSES[size]}`
    const positionClasses = DIALOG_POSITION_CLASSES[position]
    const transitionClasses = "transition-all duration-200 ease-in-out"
    const shadowClasses = "shadow-lg border-1 border-gray-200 z-50"
    const stateClasses = open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"

    return `${baseClasses} ${positionClasses} ${transitionClasses} ${shadowClasses} ${stateClasses} ${className ?? ""}`
  }, [size, position, open, className])

  const dialogPositionStyle = useMemo(() => {
    if (!offset) return undefined

    // For positioned dialogs with offset, combine with existing transforms
    const positionClass = DIALOG_POSITION_CLASSES[position]
    const hasTranslateX = positionClass.includes("-translate-x-1/2")
    const hasTranslateY = positionClass.includes("-translate-y-1/2")

    let transform = ""
    if (hasTranslateX) transform += "translateX(-50%) "
    if (hasTranslateY) transform += "translateY(-50%) "
    transform += `translate(${offset.x || 0}px, ${offset.y || 0}px)`

    return { transform: transform.trim() }
  }, [offset, position])

  const dialogContextValue = useMemo(
    () => ({
      titleId: labelledBy,
      descriptionId: describedBy,
    }),
    [labelledBy, describedBy]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  if (!open) return null

  const dialogElement = (
    <DialogContext.Provider value={dialogContextValue}>
      <div
        className={dialogClasses}
        style={dialogPositionStyle}
        role="dialog"
        aria-modal="false"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </DialogContext.Provider>
  )

  // Use portal for positioned dialogs (not relative)
  if (position !== "relative" && typeof window !== "undefined" && document.body) {
    return createPortal(dialogElement, document.body)
  }

  return dialogElement
}

export default Dialog
