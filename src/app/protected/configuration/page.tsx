import { HandRaisedIcon, UsersIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import type { ReactNode } from "react"

const NAV_ITEMS = [
  {
    label: "Users",
    href: "/protected/configuration/users",
    icon: <UsersIcon className="h-7 w-7 text-blue" />,
  },
  {
    label: "Services",
    href: "/protected/configuration/services",
    icon: <HandRaisedIcon className="h-7 w-7 text-blue" />,
  },
]

export default async function Page() {
  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: ReactNode }) => (
    <Link
      href={href}
      className="flex flex-row gap-2 py-2 px-3 w-full border border-transparent hover:bg-background-light-gray hover:border-border-active"
    >
      {icon}
      <p className="text-md font-medium hover:underline">{label}</p>
    </Link>
  )

  return (
    <div className="space-y-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h1>
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </div>
    </div>
  )
}
