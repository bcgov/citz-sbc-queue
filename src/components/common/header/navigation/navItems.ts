type NavItem = {
  label: string
  href: string
  role?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Settings", href: "/protected/settings" },
]

export type { NavItem }
