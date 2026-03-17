"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { LocationForm } from "../LocationForm"

type EditLocationModalProps = {
  open: boolean
  onClose: () => void
  location: LocationWithRelations | null
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  updateLocation: (
    location: Partial<LocationWithRelations>,
    prevLocation: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  doesLocationCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
  openConfirmArchiveLocationModal: () => void
}

export const EditLocationModal = ({
  open,
  onClose,
  location,
  services,
  counters,
  staffUsers,
  updateLocation,
  doesLocationCodeExist,
  revalidateTable,
  openConfirmArchiveLocationModal,
}: EditLocationModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<LocationWithRelations> | null>(null)
  const [previousLocation, setPreviousLocation] = useState<Partial<LocationWithRelations> | null>(
    null
  )
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  const hasMadeChanges = JSON.stringify(formData) !== JSON.stringify(previousLocation)

  const EditLocationWithRelationsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z
      .string()
      .min(1, "Code is required")
      .refine(
        async (code) => {
          if (code === previousLocation?.code) return true
          return !(await doesLocationCodeExist(code))
        },
        { message: "Code already exists" }
      ),
    streetAddress: z.string(),
    mailAddress: z.string().nullable(),
    phoneNumber: z
      .string()
      .nullable()
      .refine(
        (phone) => {
          // Allow null or empty string (optional field)
          if (!phone || phone.trim() === "") return true
          // Must contain at least 10 digits for a valid phone number
          const digits = phone.replace(/\D/g, "")
          return digits.length >= 10
        },
        { message: "Phone number must contain at least 10 digits" }
      ),
    timezone: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    legacyOfficeNumber: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    services: z.array(z.any()),
    counters: z.array(z.any()),
    staffUsers: z.array(z.any()),
  })

  useEffect(() => {
    if (open && location) {
      setFormData(location)
      setPreviousLocation(location)
    }
  }, [open, location])

  // Validate formData asynchronously and update local state instead of calling async validators during render
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (!formData) {
      setIsFormValidState(false)
      setIsFormValidating(false)
      return
    }

    let active = true
    setIsFormValidating(true)

    EditLocationWithRelationsSchema.parseAsync(formData)
      .then(() => {
        if (active) setIsFormValidState(true)
      })
      .catch(() => {
        if (active) setIsFormValidState(false)
      })
      .finally(() => {
        if (active) setIsFormValidating(false)
      })

    return () => {
      active = false
    }
  }, [formData, previousLocation, doesLocationCodeExist])

  if (!location || !formData || !previousLocation) return null

  const isArchived = location.deletedAt !== null
  const isReadonly = isArchived

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await updateLocation(formData, previousLocation)
        await revalidateTable()
        onClose()
        setIsSaving(false)
        window.location.href = "/protected/settings/locations"
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("An unknown error occurred")
        }
        setIsSaving(false)
      }
    }
  }

  const handleOpenArchive = () => {
    openConfirmArchiveLocationModal()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Location: {location.code}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {isReadonly && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              {isArchived && (
                <p className="text-sm font-medium text-red-800">
                  This location is archived and cannot be edited.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <LocationForm
            location={formData}
            services={services}
            counters={counters}
            staffUsers={staffUsers}
            setFormData={setFormData}
            doesLocationCodeExist={doesLocationCodeExist}
            isReadonly={isReadonly}
          />
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="secondary danger" onClick={handleOpenArchive}>
          {isArchived ? "Unarchive" : "Archive"}
        </button>
        <button
          type="button"
          className="primary"
          onClick={handleSave}
          disabled={
            isReadonly || isSaving || isFormValidating || !isFormValidState || !hasMadeChanges
          }
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
