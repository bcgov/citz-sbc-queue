import { NAV_ITEMS } from "@/components/settings/NAV_ITEMS"
import { NavItem } from "@/components/settings/NavItem"

export default async function Page() {
  return (
    <div className="space-y-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </div>
    </div>
  )
}
