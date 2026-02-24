type NavItem = {
  label: string
  href: string
  role?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Configuration", href: "/protected/configuration" },
]

export type { NavItem }
