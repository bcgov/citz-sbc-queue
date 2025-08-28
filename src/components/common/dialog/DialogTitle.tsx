"use client"

import { DialogTitle as HeadlessDialogTitle } from "@headlessui/react"
import type { ReactNode } from "react"
import { useMemo } from "react"
import { useDialogContext } from "./DialogContext"

export type DialogTitleProps = {
  children: ReactNode
  id?: string
  className?: string
}

/**
 * DialogTitle component for displaying the title content of a dialog.
 * Works both inside HeadlessUI Dialog context and standalone.
 *
 * @param {DialogTitleProps} props - Props for the dialog title component.
 *
 * @property {ReactNode} children - The content to render inside the dialog title.
 * @property {string} [id] - The ID to use for the dialog title element.
 * @property {string} [className] - Additional CSS classes to apply to the dialog title element.
 *
 * @example
 * <DialogTitle>Confirm action</DialogTitle>
 */
export const DialogTitle = ({ children, id, className }: DialogTitleProps) => {
  const dialogContext = useDialogContext()

  const titleClasses = useMemo(() => {
    return [
      "text-[20px] font-bold leading-6 text-typography-primary",
      `${className ?? ""}`,
    ].join(" ")
  }, [className])

  // If we're in a standalone dialog (has our custom context), use a regular h2
  if (dialogContext) {
    return (
      <h2 id={id ?? dialogContext.titleId} className={titleClasses}>
        {children}
      </h2>
    )
  }

  // If we're in a HeadlessUI Dialog context, use HeadlessDialogTitle
  return (
    <HeadlessDialogTitle id={id} className={titleClasses}>
      {children}
    </HeadlessDialogTitle>
  )
}

export default DialogTitle
