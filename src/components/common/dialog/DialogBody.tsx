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
 * @param {DialogBodyProps} props - Props for the dialog body component.
 */
export const DialogBody = ({ children, scroll = false, className }: DialogBodyProps) => {
  const bodyClasses = useMemo(() => {
    return [
      "px-4 py-3 sm:px-6 sm:py-4",
      `${scroll ? "max-h-[70vh] overflow-y-auto" : ""}`,
      `${className ?? ""}`,
    ].join(" ")
  }, [scroll, className])

  return <div className={bodyClasses}>{children}</div>
}

export default DialogBody
