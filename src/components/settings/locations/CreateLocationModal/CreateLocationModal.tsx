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

type CreateLocationModalProps = {
  open: boolean
  onClose: () => void
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  insertLocation: (
    location: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  doesLocationCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const CreateLocationModal = ({
  open,
  onClose,
  services,
  counters,
  staffUsers,
  insertLocation,
  doesLocationCodeExist,
  revalidateTable,
}: CreateLocationModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<LocationWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  // initialize form data when the modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        code: "",
        streetAddress: "",
        mailAddress: null,
        phoneNumber: null,
        timezone: "America/Vancouver",
        latitude: undefined,
        longitude: undefined,
        legacyOfficeNumber: null,
        deletedAt: null,
        services: [],
        counters: [],
        staffUsers: [],
      })
    } else {
      setFormData(null)
      setIsFormValidState(false)
      setIsFormValidating(false)
    }
  }, [open])

  const NewLocationWithRelationsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z
      .string()
      .min(1, "Code is required")
      .refine(
        async (code) => {
          return !(await doesLocationCodeExist(code))
        },
        { message: "Code already exists" }
      ),
    streetAddress: z.string(),
    mailAddress: z.string().nullable(),
    timezone: z.string(),
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
    latitude: z.number(),
    longitude: z.number(),
    legacyOfficeNumber: z.number().nullable(),
    services: z.array(z.any()),
    counters: z.array(z.any()),
    staffUsers: z.array(z.any()),
  })

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

    NewLocationWithRelationsSchema.parseAsync(formData)
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
  }, [formData, doesLocationCodeExist])

  if (!formData) return null

  const isArchived = formData.deletedAt !== null
  const isReadonly = isArchived

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await insertLocation(formData)
        await revalidateTable()
        onClose()
        setIsSaving(false)
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

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Create Location</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
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
        <button
          type="button"
          className="primary"
          onClick={handleSave}
          disabled={isSaving || isFormValidating || !isFormValidState}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
