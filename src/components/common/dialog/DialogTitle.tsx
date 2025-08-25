"use client"

import { DialogTitle as HeadlessDialogTitle } from "@headlessui/react"
import type { ReactNode } from "react"
import { useMemo } from "react"

export type DialogTitleProps = {
  children: ReactNode
  id?: string
  className?: string
}

/**
 * DialogTitle component for displaying the title content of a dialog.
 * @param {DialogTitleProps} props - Props for the dialog title component.
 */
export const DialogTitle = ({ children, id, className }: DialogTitleProps) => {
  const titleClasses = useMemo(() => {
    return [
      "text-[20px] font-bold leading-6 text-[var(--color-typography-primary)]",
      `${className ?? ""}`,
    ].join(" ")
  }, [className])

  return (
    <HeadlessDialogTitle id={id} className={titleClasses}>
      {children}
    </HeadlessDialogTitle>
  )
}

export default DialogTitle
