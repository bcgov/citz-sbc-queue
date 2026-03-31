"use client"

import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { SelectInput } from "@/components/common/select/SelectInput"
import type { Counter } from "@/generated/prisma/client"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"

type LocationCounterSwitchProps = {
  getAllLocations: () => Promise<LocationWithRelations[]>
  getStaffUserBySub: (sub: string) => Promise<StaffUserWithRelations | null>
  updateStaffUser: (
    user: Partial<StaffUserWithRelations>,
    prevUser: Partial<StaffUserWithRelations>
  ) => Promise<StaffUserWithRelations | null>
}

export const LocationCounterSwitch = ({
  getAllLocations,
  getStaffUserBySub,
  updateStaffUser,
}: LocationCounterSwitchProps) => {
  const { sub, role } = useAuth()
  const { open, openDialog, closeDialog } = useDialog()
  const [currentUser, setCurrentUser] = useState<StaffUserWithRelations | null>(null)
  const [prevUser, setPrevUser] = useState<StaffUserWithRelations | null>(null)
  const [locations, setLocations] = useState<LocationWithRelations[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationWithRelations | null>(null)
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null)

  useEffect(() => {
    if (currentUser) {
      if (currentUser.location) {
        // Location
        const codeToMatch = currentUser.locationCode || currentUser.location.code
        const foundLocation = locations?.find((l) => l?.code === codeToMatch) || null
        setSelectedLocation(foundLocation)
        // Counter
        const idToMatch = currentUser.counterId || currentUser.counter?.id
        const defaultCounter = foundLocation?.counters?.find((c) => c?.name === "Counter") || null
        const foundCounter =
          foundLocation?.counters?.find((c) => c?.id === idToMatch) || defaultCounter
        setSelectedCounter(foundCounter)
      } else {
        setSelectedLocation(null)
        setSelectedCounter(null)
      }
    }
  }, [currentUser, locations])

  useEffect(() => {
    const fetchUser = async () => {
      if (sub) {
        const user = await getStaffUserBySub(sub)
        setCurrentUser(user)
        setPrevUser(user)
      }
    }
    fetchUser()
  }, [sub, getStaffUserBySub])

  useEffect(() => {
    const fetchLocations = async () => {
      const locationsData = await getAllLocations()
      setLocations(locationsData || [])
    }
    fetchLocations()
  }, [getAllLocations])

  if (!currentUser) return null

  const handleCloseModal = () => {
    // Reset selections on cancel
    if (prevUser?.location) {
      const codeToMatch = prevUser.locationCode || prevUser.location.code
      const foundLocation = locations?.find((l) => l?.code === codeToMatch) || null
      setSelectedLocation(foundLocation)

      const idToMatch = prevUser.counterId || prevUser.counter?.id
      const defaultCounter = foundLocation?.counters?.find((c) => c?.name === "Counter") || null
      const foundCounter =
        foundLocation?.counters?.find((c) => c?.id === idToMatch) || defaultCounter
      setSelectedCounter(foundCounter)
    }
    closeDialog()
  }

  const handleConfirm = async () => {
    if (!currentUser || !prevUser || !selectedLocation || !selectedCounter) return

    const updatedUser = await updateStaffUser(
      {
        locationCode: selectedLocation?.code,
        counterId: selectedCounter?.id,
      },
      prevUser
    )

    if (updatedUser) {
      setCurrentUser(updatedUser)
      setPrevUser(updatedUser)
    }

    closeDialog()
  }

  const handleLocationChange = (locationCode: string) => {
    const loc = locations?.find((l) => l?.code === locationCode) || null
    setSelectedLocation(loc)
  }

  const handleCounterChange = (counterId: string) => {
    const counter = selectedLocation?.counters?.find((c) => c?.id === counterId) || null
    setSelectedCounter(counter)
  }

  const locationOptions =
    locations && locations.length > 0
      ? locations.map((loc) => ({ label: loc.name || "", value: loc.code || "" }))
      : []

  const counterOptions =
    selectedLocation?.counters && selectedLocation.counters.length > 0
      ? selectedLocation.counters.map((counter) => ({
          label: counter.name || "",
          value: counter.id || "",
        }))
      : []

  const selectedLocationCode = selectedLocation?.code ?? ""
  const selectedCounterId = selectedCounter?.id ?? ""
  const isLocationDisabled = !locations || locations.length === 0
  const isCounterDisabled =
    !selectedLocation || !selectedLocation.counters || selectedLocation.counters.length === 0

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-sm font-bold">{currentUser.location?.name ?? "No Location"}</span>
          <span className="text-xs">{currentUser.counter?.name ?? "No Counter"}</span>
        </div>
        <button
          type="button"
          className="rounded border border-border-light p-1.5 text-typography-primary transition-colors hover:bg-background-light-gray focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Switch location or counter"
          disabled={role === "Authenticated"}
          onClick={openDialog}
        >
          <ArrowsRightLeftIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="w-px h-8 bg-border-light mx-sm" />
      {/* Modal */}
      <Modal open={open} onClose={handleCloseModal} size="sm">
        <DialogHeader trailing={<CloseButton onClick={handleCloseModal} />}>
          <DialogTitle>Change Location or Counter</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-4">
            <SelectInput
              id="location"
              label="Location"
              value={selectedLocationCode}
              onChange={handleLocationChange}
              disabled={isLocationDisabled}
              options={locationOptions}
            />
            <SelectInput
              id="counter"
              label="Counter"
              value={selectedCounterId}
              onChange={handleCounterChange}
              disabled={isCounterDisabled}
              options={counterOptions}
            />
          </div>
        </DialogBody>

        <DialogActions>
          <button type="button" className="tertiary" onClick={handleCloseModal}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={handleConfirm}>
            Confirm
          </button>
        </DialogActions>
      </Modal>
    </>
  )
}
