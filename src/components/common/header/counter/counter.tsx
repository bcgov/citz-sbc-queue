"use client"

import { useEffect, useState } from "react"
import { PencilSquareIcon } from "@heroicons/react/24/outline"
import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { StaffUser, Counter, Location } from "@/generated/prisma/client"
import { useAuth, useDialog } from "@/hooks"

type CounterButtonProps = {
  getStaffUserBySub: (sub: string) => Promise<StaffUser | null>
  getCounterById: (id: string) => Promise<Counter | null>
  getLocationById: (id: string) => Promise<Location | null>
}

export const CounterButton = ({
  getStaffUserBySub,
  getCounterById,
  getLocationById
}: CounterButtonProps) => {
  const { open, openDialog, closeDialog } = useDialog()
  const { isAuthenticated, sub } = useAuth()

    // Fetch staff user availability
  useEffect(() => {
    const fetchStaffUser = async () => {
      const StaffUser = sub ? await getStaffUserBySub(sub) : null
      if (StaffUser) {
        const counterId = StaffUser ? StaffUser.counterId : ""
        const locationId = StaffUser ? StaffUser.locationId : ""
        const counter = StaffUser ? await getCounterById(StaffUser.counterId): ""
        const location = await getLocationById(locationId)
        console.log("Counter:", counter)
        console.log("Location:", location)

      }
    }

    if (isAuthenticated && sub) fetchStaffUser()

  }, [isAuthenticated, sub, getStaffUserBySub])

  const UserLocationCounter = () => {
    return (
      <span className="text-sm text-text-secondary">
        <p>Location here</p> <p>Counter here</p>
      </span>
    )
  }

  return (
    <div className="hidden md:flex flex-row gap-sm items-center">
      <UserLocationCounter />
      <button type="button" className="icon tertiary" onClick={openDialog}>
        <PencilSquareIcon />
      </button>

      {/* Modal */}
      <Modal open={open} onClose={closeDialog} size="sm">
        <DialogHeader trailing={<CloseButton onClick={closeDialog} />}>
          <DialogTitle>Location & Counter</DialogTitle>
        </DialogHeader>

        <DialogBody>
          Are you sure you want to proceed with this action? This change cannot be undone. Please
          review the details before confirming
        </DialogBody>

        <DialogActions>
          <button type="button" className="tertiary" onClick={closeDialog}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={closeDialog}>
            Confirm
          </button>
        </DialogActions>
      </Modal>
    </div>
  )
}
