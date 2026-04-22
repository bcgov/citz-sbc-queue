import { useEffect, useState } from "react"
import { z } from "zod"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type UseCreateLocationModalProps = {
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

/**
 * Custom hook encapsulating all logic for the CreateLocationModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.insertLocation - Async function to persist the new location.
 * @property props.doesLocationCodeExist - Async function to check if a location code is already taken.
 * @property props.revalidateTable - Async function to refresh the locations table.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useCreateLocationModal = ({
  open,
  onClose,
  insertLocation,
  doesLocationCodeExist,
  revalidateTable,
}: UseCreateLocationModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<LocationWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  // Initialize form data when the modal opens
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
          if (!phone || phone.trim() === "") return true
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

  const isArchived = formData?.deletedAt !== null
  const isReadonly = isArchived ?? false

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await insertLocation(formData)
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

  const isSaveDisabled = isSaving || isFormValidating || !isFormValidState

  return {
    isSaving,
    error,
    formData,
    setFormData,
    isFormValidating,
    isFormValidState,
    isArchived,
    isReadonly,
    isSaveDisabled,
    handleSave,
  }
}
