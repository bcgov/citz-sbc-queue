import { useEffect, useState } from "react"
import { z } from "zod"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type UseCreateServiceModalProps = {
  open: boolean
  onClose: () => void
  insertService: (service: Partial<ServiceWithRelations>) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the CreateServiceModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.insertService - Async function to persist the new service.
 * @property props.doesServiceCodeExist - Async function to check for duplicate service codes.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useCreateServiceModal = ({
  open,
  onClose,
  insertService,
  doesServiceCodeExist,
  revalidateTable,
}: UseCreateServiceModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  // Initialize form data when the modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        code: "",
        description: "",
        publicName: "",
        ticketPrefix: "",
        legacyServiceId: null,
        backOffice: false,
        deletedAt: null,
        locations: [],
        categories: [],
      })
    } else {
      setFormData(null)
      setIsFormValidState(false)
      setIsFormValidating(false)
    }
  }, [open])

  const NewServiceWithRelationsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z
      .string()
      .min(1, "Code is required")
      .refine(
        async (code) => {
          return !(await doesServiceCodeExist(code))
        },
        { message: "Code already exists" }
      ),
    description: z.string(),
    publicName: z.string().min(1, "Public name is required"),
    ticketPrefix: z.string().min(1, "Ticket prefix is required"),
    legacyServiceId: z.number().nullable(),
    backOffice: z.boolean(),
    locations: z.array(z.any()),
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

    NewServiceWithRelationsSchema.parseAsync(formData)
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
  }, [formData, doesServiceCodeExist])

  const isArchived = formData?.deletedAt !== null
  const isReadonly = isArchived ?? false

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await insertService(formData)
        await revalidateTable()
        onClose()
        setIsSaving(false)
        window.location.href = "/protected/settings/services"
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
