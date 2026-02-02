"use client"

import { useEffect, useState } from "react"
import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { Switch } from "@/components/common/switch"
import type { StaffUser } from "@/generated/prisma/client"
import { useAuth, useDialog } from "@/hooks"

type AvailabilitySwitchProps = {
  toggleAvailableBySub: (sub: string, isAvailable: boolean) => void
  getStaffUserBySub: (sub: string) => Promise<StaffUser | null>
}

/**
 * Switch for toggling staff user availability status.
 * Opens a blocking modal when set to unavailable.
 */
export const AvailabilitySwitch = ({
  toggleAvailableBySub,
  getStaffUserBySub,
}: AvailabilitySwitchProps) => {
  const { open, openDialog, closeDialog } = useDialog()
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

  const onClose = () => {
    setAvailable(true)
    closeDialog()
  }

  const onOpen = () => {
    setAvailable(!available)
    openDialog()
  }

  return (
    <div className="hidden md:flex flex-row gap-sm items-center">
      <span className="text-sm text-text-secondary">{available ? "Available" : "Unavailable"}</span>
      <Switch checked={available} onChange={onOpen} />

      {/* Modal */}
      <Modal open={open} onClose={onClose} size="sm">
        <DialogHeader trailing={<CloseButton onClick={onClose} />}>
          <DialogTitle>Availability Paused</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <p>
            You’re temporarily removed from the queue. Your colleagues will see that you’re
            unavailable until you return to available status.
          </p>
        </DialogBody>

        <DialogActions>
          <button type="button" className="primary" onClick={onClose}>
            Return to Availability
          </button>
        </DialogActions>
      </Modal>
    </div>
  )
}
