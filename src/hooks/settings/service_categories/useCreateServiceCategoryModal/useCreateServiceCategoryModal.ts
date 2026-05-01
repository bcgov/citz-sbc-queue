import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import type { Service } from "@/generated/prisma/client"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type UseCreateServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  services: Service[]
  insertServiceCategory: (
    service: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the CreateServiceCategoryModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.insertServiceCategory - Async function to persist the new service category.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useCreateServiceCategoryModal = ({
  open,
  onClose,
  insertServiceCategory,
  revalidateTable,
}: UseCreateServiceCategoryModalProps) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceCategoryWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  // Initialize form data when the modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        deletedAt: null,
        services: [],
      })
    } else {
      setFormData(null)
      setIsFormValidState(false)
      setIsFormValidating(false)
    }
  }, [open])

  const NewServiceCategoryWithRelationsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    services: z.array(z.any()),
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

    NewServiceCategoryWithRelationsSchema.parseAsync(formData)
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
  }, [formData])

  const isArchived = formData?.deletedAt !== null
  const isReadonly = isArchived ?? false

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await insertServiceCategory(formData)
        await revalidateTable()
        onClose()
        setIsSaving(false)
        router.refresh()
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
