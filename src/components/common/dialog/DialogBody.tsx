"use client"

import type { ReactNode } from "react"
import { useMemo } from "react"

export type DialogBodyProps = {
  children: ReactNode
  scroll?: boolean
  className?: string
}

/**
 * DialogBody component for displaying the body content of a dialog.
 *
 * @param {DialogBodyProps} props - Props for the dialog body component.
 *
 * @property {ReactNode} children - The content to render inside the dialog body.
 * @property {boolean} [scroll=false] - Whether the dialog body should be scrollable.
 * @property {string} [className] - Additional CSS classes to apply to the dialog body container.
 */
export const DialogBody = ({ children, scroll = false, className }: DialogBodyProps) => {
  const bodyClasses = useMemo(() => {
    return [
      "p-[24px] gap-[8px] leading[27px] text-[var(--color-typography-secondary)] text-[16px]",
      `${scroll ? "max-h-[70vh] overflow-y-auto" : ""}`,
      `${className ?? ""}`,
    ].join(" ")
  }, [scroll, className])

  return <div className={bodyClasses}>{children}</div>
}

export default DialogBody
