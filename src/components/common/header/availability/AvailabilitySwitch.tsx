"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/common/switch"
import type { StaffUser } from "@/generated/prisma/client"
import { useAuth } from "@/hooks"

type AvailabilitySwitchProps = {
  toggleAvailableBySub: (sub: string, isAvailable: boolean) => void
  getStaffUserBySub: (sub: string) => Promise<StaffUser | null>
}

export const AvailabilitySwitch = ({
  toggleAvailableBySub,
  getStaffUserBySub,
}: AvailabilitySwitchProps) => {
  const { isAuthenticated, sub } = useAuth()
  const [available, setAvailable] = useState(true)

  // Fetch staff user availability
  useEffect(() => {
    const fetchStaffUser = async () => {
      const StaffUser = sub ? await getStaffUserBySub(sub) : null
      if (StaffUser) setAvailable(StaffUser.isActive)
    }

    if (isAuthenticated && sub) fetchStaffUser()
  }, [isAuthenticated, sub, getStaffUserBySub])

  // Update availability status when toggled
  useEffect(() => {
    if (sub) toggleAvailableBySub(sub, available)
  }, [available, toggleAvailableBySub, sub])

  if (!isAuthenticated || !sub) return null

  return (
    <div className="hidden md:flex flex-row gap-sm items-center">
      <span className="text-sm text-text-secondary">{available ? "Available" : "Unavailable"}</span>
      <Switch checked={available} onChange={setAvailable} />
    </div>
  )
}
