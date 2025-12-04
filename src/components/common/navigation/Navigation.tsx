"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IsAuthenticated } from "@/components"
import styles from "./Navigation.module.css"

type NavItem = {
  label: string
  href: string
  role?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Appointment Booking", href: "/appointments" },
  { label: "Queue", href: "/queue" },
  { label: "Room Bookings", href: "/room-bookings" },
  { label: "Appointments", href: "/appointments-list" },
  { label: "Exam Inventory", href: "/exam-inventory" },
  { label: "Administration", href: "/administration", role: "Administrator" },
]

export const Navigation = () => {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    if (!pathname) return false
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
