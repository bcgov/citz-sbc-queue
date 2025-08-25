"use client"

import { type ReactNode, useMemo } from "react"

export type DialogHeaderProps = {
  children: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  className?: string
}

/**
 * DialogHeader component for displaying the header content of a dialog.
 * @param {DialogHeaderProps} props - Props for the dialog header component.
 */
export const DialogHeader = ({ children, leading, trailing, className }: DialogHeaderProps) => {
  const headerClasses = useMemo(() => {
    return [
      "flex items-start gap-3 border-b border-gray-100 px-4 py-3 ",
      "sm:px-6 sm:py-4",
      `${className ?? ""}`,
    ].join(" ")
  }, [className])

  return (
    <div className={headerClasses}>
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 grow">{children}</div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}

export default DialogHeader
