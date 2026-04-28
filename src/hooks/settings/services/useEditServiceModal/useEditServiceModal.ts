import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type UseEditServiceModalProps = {
  open: boolean
  onClose: () => void
  service: ServiceWithRelations | null
  canEdit: boolean
  canArchive: boolean
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
  openConfirmArchiveServiceModal: () => void
}

/**
 * Custom hook encapsulating all logic for the EditServiceModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.service - The service being edited.
 * @property props.canEdit - Whether the current user can edit this service.
 * @property props.canArchive - Whether the current user can archive this service.
 * @property props.updateService - Async function to persist changes.
 * @property props.doesServiceCodeExist - Async function to check for duplicate service codes.
 * @property props.revalidateTable - Async function to refresh the table.
 * @property props.openConfirmArchiveServiceModal - Callback to open the archive confirmation modal.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useEditServiceModal = ({
  open,
  onClose,
  service,
  canEdit,
  updateService,
  doesServiceCodeExist,
  revalidateTable,
  openConfirmArchiveServiceModal,
}: UseEditServiceModalProps) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceWithRelations> | null>(null)
  const [previousService, setPreviousService] = useState<Partial<ServiceWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  const hasMadeChanges = JSON.stringify(formData) !== JSON.stringify(previousService)

  const EditServiceWithRelationsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z
      .string()
      .min(1, "Code is required")
      .refine(
        async (code) => {
          if (code === previousService?.code) return true
          return !(await doesServiceCodeExist(code))
        },
        { message: "Code already exists" }
      ),
    description: z.string(),
    publicName: z.string().min(1, "Public name is required"),
    ticketPrefix: z.string().min(1, "Ticket prefix is required"),
    legacyServiceId: z.number().nullable(),
    backOffice: z.boolean(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    locations: z.array(z.any()),
    categories: z.array(z.any()),
  })

  useEffect(() => {
    if (open && service) {
      setFormData(service)
      setPreviousService(service)
    }
  }, [open, service])

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

    EditServiceWithRelationsSchema.parseAsync(formData)
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
  }, [formData, previousService, doesServiceCodeExist])

  const isArchived = service?.deletedAt !== null
  const isReadonly = (isArchived ?? false) || !canEdit

  const handleSave = async () => {
    if (formData && previousService && !isReadonly) {
      try {
        setIsSaving(true)
        await updateService(formData, previousService)
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
    openConfirmArchiveServiceModal()
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
