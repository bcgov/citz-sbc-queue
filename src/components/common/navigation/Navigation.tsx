import Link from "next/link"
import { IsAuthenticated } from "@/components"
import { NAV_ITEMS } from "./navItems"

type NavigationProps = {
  currentPath?: string
}

export const Navigation = ({ currentPath }: NavigationProps) => {
  const pathname = currentPath

  const isActive = (href: string): boolean => {
    if (!pathname) return false
    // Exact match for root path
    if (href === "/") return pathname === "/"
    // For non-root paths, match exact or nested routes
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <ul className="max-w-[1200px] mx-auto flex list-none p-0 gap-4 flex-wrap">
        {NAV_ITEMS.map((item) => (
          <li key={item.href} className="flex items-center">
            <IsAuthenticated hasRole={item.role}>
              <Link
                href={item.href}
                className={
                  "inline-flex items-center py-3 px-3 text-[var(--color-typography-primary)] no-underline font-medium transition-colors relative border-b-4 border-transparent " +
                  (isActive(item.href)
                    ? "text-[var(--color-surface-primary)] border-b-[3px] border-[var(--color-gold)] font-bold"
                    : "hover:text-[var(--color-surface-primary)]")
                }
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            </IsAuthenticated>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
