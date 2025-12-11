"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IsAuthenticated } from "@/components"
import { NAV_ITEMS } from "./navItems"

export const Navigation = () => {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    if (!pathname) return false
    // Exact match for root path
    if (href === "/") return pathname === "/"
    // For non-root paths, match exact or nested routes
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className=" border-b border-gray-200">
      <ul className="max-w-[1200px] mx-auto flex gap-4 flex-wrap">
        {NAV_ITEMS.map((item) => (
          <li key={item.href} className="flex items-center">
            <IsAuthenticated hasRole={item.role}>
              <Link
                href={item.href}
                className={
                  "inline-flex items-center p-3 border-b-4 " +
                  (isActive(item.href)
                    ? "border-b-gold text-surface-primary font-bold"
                    : "border-transparent hover:text-surface-primary")
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
