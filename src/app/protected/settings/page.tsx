import { ShieldCheckIcon } from "@heroicons/react/24/outline"
import { headers } from "next/headers"
import { NAV_ITEMS } from "@/components/settings/NAV_ITEMS"
import { NavItem } from "@/components/settings/NavItem"
import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { getAuthContext } from "@/utils/auth/getAuthContext"

export default async function Page() {
  const headersList = await headers()
  const authContext = getAuthContext(headersList)
  const user = authContext?.user

  const currentUser = await getStaffUserBySub(user?.sub ?? "")

  const navigationItems = [
    ...NAV_ITEMS,
    ...(currentUser?.isDeveloper
      ? [
          {
            label: "Developer Settings",
            href: "/protected/settings/developer",
            icon: <ShieldCheckIcon className="h-7 w-7 text-blue" />,
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </div>
    </div>
  )
}
