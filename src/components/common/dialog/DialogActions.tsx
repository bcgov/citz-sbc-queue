"use client"

import { type ReactNode, useMemo } from "react"
import { ALIGN_MAP } from "./constants"
import type { Align } from "./types"

export type DialogActionsProps = {
  children: ReactNode
  align?: Align
  className?: string
}

/**
 * DialogActions component for displaying actions in a dialog.
 * @param {DialogActionsProps} props - Props for the dialog actions component.
 */
export const DialogActions = ({ children, align = "end", className }: DialogActionsProps) => {
  const actionClasses = useMemo(() => {
    return [
      `flex ${ALIGN_MAP[align]} gap-3 border-t border-[var(--color-border-light)] px-[24px] py-[16px]`,
      `${className ?? ""}`,
    ].join(" ")
  }, [align, className])

  return <div className={actionClasses}>{children}</div>
}

export default DialogActions
