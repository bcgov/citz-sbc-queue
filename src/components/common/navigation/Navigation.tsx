import Link from "next/link"
import { IsAuthenticated } from "@/components"
import styles from "./Navigation.module.css"
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
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.href} className={styles.navItem}>
            <IsAuthenticated hasRole={item.role}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
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
