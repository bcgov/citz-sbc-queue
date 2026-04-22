import { useEffect, useState } from "react"
import { z } from "zod"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type UseEditLocationModalProps = {
  open: boolean
  onClose: () => void
  location: LocationWithRelations | null
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  canEdit: boolean
  canArchive: boolean
  updateLocation: (
    location: Partial<LocationWithRelations>,
    prevLocation: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  doesLocationCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
  openConfirmArchiveLocationModal: () => void
}

/**
 * Custom hook encapsulating all logic for the EditLocationModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.location - The location being edited.
 * @property props.services - Full list of available services.
 * @property props.counters - Full list of available counters.
 * @property props.staffUsers - Full list of available staff users.
 * @property props.canEdit - Whether the current user can edit this location.
 * @property props.canArchive - Whether the current user can archive this location.
 * @property props.updateLocation - Async function to persist location changes.
 * @property props.doesLocationCodeExist - Async function to check if a location code is already taken.
 * @property props.revalidateTable - Async function to refresh the locations table.
 * @property props.openConfirmArchiveLocationModal - Callback to open the archive confirmation modal.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useEditLocationModal = ({
  open,
  onClose,
  location,
  canEdit,
  updateLocation,
  doesLocationCodeExist,
  revalidateTable,
  openConfirmArchiveLocationModal,
}: UseEditLocationModalProps) => {
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
    streetAddress: z.string().nullable(),
    mailAddress: z.string().nullable(),
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
    timezone: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
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

  const isArchived = location?.deletedAt !== null
  const isReadonly = (isArchived ?? false) || !canEdit

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await updateLocation(formData, previousLocation as Partial<LocationWithRelations>)
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

  const isSaveDisabled =
    isReadonly || isSaving || isFormValidating || !isFormValidState || !hasMadeChanges

  return {
    isSaving,
    error,
    formData,
    setFormData,
    isFormValidating,
    isFormValidState,
    hasMadeChanges,
    isArchived,
    isReadonly,
    isSaveDisabled,
    handleSave,
    handleOpenArchive,
  }
}
