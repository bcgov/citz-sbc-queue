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
 *
 * @param {DialogHeaderProps} props - Props for the dialog header component.
 *
 * @property {ReactNode} children - The content to render inside the dialog header.
 * @property {ReactNode} [leading] - The content to render at the start of the dialog header.
 * @property {ReactNode} [trailing] - The content to render at the end of the dialog header.
 * @property {string} [className] - Additional CSS classes to apply to the dialog header container.
 *
 * @example
 * <DialogHeader trailing={<CloseButton onClick={closeDialog} />}>
 *   <DialogTitle>Confirm action</DialogTitle>
 * </DialogHeader>
 */
export const DialogHeader = ({ children, leading, trailing, className }: DialogHeaderProps) => {
  const headerClasses = useMemo(() => {
    return [
      "flex items-center gap-3 border-b border-[var(--color-border-light)] px-[24px] py-[16px]",
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
