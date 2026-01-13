import type { ReactNode } from "react"

type SectionProps = {
  title: string
  disabled: boolean
  children: ReactNode
}

export const Section = ({ title, disabled, children }: SectionProps) => {
  return (
    <div
      className={`space-y-md rounded-lg border border-border-light bg-background-light-gray p-md shadow-sm ${disabled ? "opacity-50" : ""}`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <div className="space-y-sm">{children}</div>
    </div>
  )
}
