import Link from "next/link"
import type { ReactNode } from "react"

export const NavItem = ({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: ReactNode
}) => (
  <Link
    href={href}
    className="flex flex-row gap-2 py-2 px-3 w-full border border-transparent hover:bg-background-light-gray hover:border-border-active"
  >
    {icon}
    <p className="text-md font-medium hover:underline">{label}</p>
  </Link>
)
