import { useEffect, useState } from "react"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type UseConfirmArchiveServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  serviceCategory: ServiceCategoryWithRelations | null
  serviceCategories?: ServiceCategoryWithRelations[]
  updateServiceCategory: (
    serviceCategory: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the ConfirmArchiveServiceCategoryModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.serviceCategory - The service category to archive or unarchive.
 * @property props.serviceCategories - Full list of service categories for reassignment options.
 * @property props.updateServiceCategory - Async function to persist the archive/unarchive change.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, and handlers for the modal.
 */
export const useConfirmArchiveServiceCategoryModal = ({
  open,
  onClose,
  serviceCategory,
  serviceCategories = [],
  updateServiceCategory,
  revalidateTable,
}: UseConfirmArchiveServiceCategoryModalProps) => {
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceCategoryWithRelations | null>(null)
  const [previousServiceCategory, setPreviousServiceCategory] =
    useState<ServiceCategoryWithRelations | null>(null)
  const [archiveConfirmation, setArchiveConfirmation] = useState("")
  const [serviceAction, setServiceAction] = useState<"remove" | "reassign" | "">("")
  const [newCategoryId, setNewCategoryId] = useState<string>("")

  const isArchived = serviceCategory?.deletedAt !== null
  const hasServices = (serviceCategory?.services?.length ?? 0) > 0

  useEffect(() => {
    if (open && serviceCategory) {
      setFormData(serviceCategory)
      setPreviousServiceCategory(serviceCategory)
      setArchiveConfirmation("")
      setServiceAction("")
      setNewCategoryId("")
    }
  }, [open, serviceCategory])

  const handleSave = async () => {
    try {
      if (formData && previousServiceCategory) {
        if (!isArchived && hasServices) {
          if (serviceAction === "remove") {
            // Detach services
            await updateServiceCategory({ id: formData.id, deletedAt: new Date(), services: [] })
          } else if (serviceAction === "reassign" && newCategoryId) {
            // Reassign services to the new category
            const newCategory = serviceCategories.find((c) => c.id === newCategoryId)
            if (newCategory) {
              const mergedServices = [
                ...(newCategory.services || []),
                ...(serviceCategory?.services || []),
              ]
              // Deduplicate services by code
              const uniqueServices = Array.from(
                new Map(mergedServices.map((s) => [s.code, s])).values()
              )
              // Update the new category to include the transferred services
              await updateServiceCategory({ id: newCategoryId, services: uniqueServices })
            }
            // Now archive the current category and detach its services
            await updateServiceCategory({ id: formData.id, deletedAt: new Date(), services: [] })
          }
        } else {
          await updateServiceCategory({
            id: formData.id,
            deletedAt: isArchived ? null : new Date(),
          })
        }

        await revalidateTable()
        setArchiveConfirmation("")
        onClose()
        window.location.href = "/protected/settings/service-categories"
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  const isSaveDisabled =
    archiveConfirmation !== serviceCategory?.name ||
    (!isArchived && hasServices && !serviceAction) ||
    (!isArchived && hasServices && serviceAction === "reassign" && !newCategoryId)

  return {
    error,
    formData,
    archiveConfirmation,
    setArchiveConfirmation,
    serviceAction,
    setServiceAction,
    newCategoryId,
    setNewCategoryId,
    isArchived,
    hasServices,
    isSaveDisabled,
    handleSave,
    serviceCategories,
  }
}
