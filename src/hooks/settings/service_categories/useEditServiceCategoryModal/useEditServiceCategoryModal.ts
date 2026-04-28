import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import type { Service } from "@/generated/prisma/client"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type UseEditServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  serviceCategory: ServiceCategoryWithRelations | null
  services: Service[]
  canEdit: boolean
  canArchive: boolean
  updateServiceCategory: (
    serviceCategory: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
  openConfirmArchiveServiceCategoryModal: () => void
}

/**
 * Custom hook encapsulating all logic for the EditServiceCategoryModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.serviceCategory - The service category being edited.
 * @property props.canEdit - Whether the current user can edit this service category.
 * @property props.canArchive - Whether the current user can archive this service category.
 * @property props.updateServiceCategory - Async function to persist changes.
 * @property props.revalidateTable - Async function to refresh the table.
 * @property props.openConfirmArchiveServiceCategoryModal - Callback to open the archive confirmation modal.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useEditServiceCategoryModal = ({
  open,
  onClose,
  serviceCategory,
  canEdit,
  updateServiceCategory,
  revalidateTable,
  openConfirmArchiveServiceCategoryModal,
}: UseEditServiceCategoryModalProps) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceCategoryWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  const EditServiceCategoryWithRelationsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    services: z.array(z.any()),
  })

  useEffect(() => {
    if (open && serviceCategory) {
      setFormData(serviceCategory)
    }
  }, [open, serviceCategory])

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

    EditServiceCategoryWithRelationsSchema.parseAsync(formData)
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

  const isArchived = serviceCategory?.deletedAt !== null
  const isReadonly = (isArchived ?? false) || !canEdit

  const hasMadeChanges = JSON.stringify(formData) !== JSON.stringify(serviceCategory)

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await updateServiceCategory(formData)
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

  const handleOpenArchive = () => {
    openConfirmArchiveServiceCategoryModal()
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
