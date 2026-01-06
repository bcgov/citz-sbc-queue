type NavItem = {
  label: string
  href: string
  role?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Appointment Booking", href: "/appointments" },
  { label: "Queue", href: "/queue" },
  { label: "Room Bookings", href: "/room-bookings" },
  { label: "Appointments", href: "/appointments-list" },
  { label: "Exam Inventory", href: "/exam-inventory" },
  { label: "Administration", href: "/administration", role: "Administrator" },
]

export type { NavItem }
