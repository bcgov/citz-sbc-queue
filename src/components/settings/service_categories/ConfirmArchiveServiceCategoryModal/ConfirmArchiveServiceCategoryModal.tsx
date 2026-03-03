"use client"

import { useEffect, useState } from "react"
import {
  CloseButton,
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { SelectInput } from "@/components/common/select"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

type ConfirmArchiveServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  serviceCategory: ServiceCategoryWithRelations | null
  serviceCategories?: ServiceCategoryWithRelations[]
  updateServiceCategory: (
    serviceCategory: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const ConfirmArchiveServiceCategoryModal = ({
  open,
  onClose,
  serviceCategory,
  serviceCategories = [],
  updateServiceCategory,
  revalidateTable,
}: ConfirmArchiveServiceCategoryModalProps) => {
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

  if (!serviceCategory || !formData || !previousServiceCategory) return null

  const handleSave = async () => {
    if (formData) {
      if (!isArchived && hasServices) {
        if (serviceAction === "remove") {
          // Detach services
          await updateServiceCategory({ ...formData, deletedAt: new Date(), services: [] })
        } else if (serviceAction === "reassign" && newCategoryId) {
          // Reassign services to the new category
          const newCategory = serviceCategories.find((c) => c.id === newCategoryId)
          if (newCategory) {
            const mergedServices = [
              ...(newCategory.services || []),
              ...(serviceCategory.services || []),
            ]
            // Deduplicate services by code
            const uniqueServices = Array.from(
              new Map(mergedServices.map((s) => [s.code, s])).values()
            )

            // Update the new category to include the transferred services
            await updateServiceCategory({ id: newCategoryId, services: uniqueServices })
          }
          // Now archive the current category and detach its services
          await updateServiceCategory({ ...formData, deletedAt: new Date(), services: [] })
        }
      } else {
        await updateServiceCategory({ ...formData, deletedAt: isArchived ? null : new Date() })
      }

      await revalidateTable()
      setArchiveConfirmation("")
      onClose()
    }
  }

  const isSaveDisabled =
    archiveConfirmation !== serviceCategory.name ||
    (!isArchived && hasServices && !serviceAction) ||
    (!isArchived && hasServices && serviceAction === "reassign" && !newCategoryId)

  return (
    <Modal open={open} onClose={onClose} size={hasServices ? "md" : "sm"}>
      <DialogHeader trailing={<CloseButton onClick={onClose} />} className="bg-background-danger">
        <DialogTitle className="text-white">
          {isArchived ? "Unarchive" : "Archive"} Service Category
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {!isArchived && hasServices && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-typography-primary">
                This category has {serviceCategory.services.length} associated service
                {serviceCategory.services.length === 1 ? "" : "s"}. What would you like to do with
                them?
              </p>
              <SelectInput
                id="service-action"
                label="Action for services"
                value={serviceAction}
                onChange={(value) => setServiceAction(value as "remove" | "reassign")}
                disabled={false}
                options={[
                  { value: "", label: "Select an action..." },
                  { value: "remove", label: "Remove services from category" },
                  { value: "reassign", label: "Change services to a new category" },
                ]}
              />

              {serviceAction === "reassign" && (
                <SelectInput
                  id="new-category"
                  label="Select new category"
                  value={newCategoryId}
                  onChange={setNewCategoryId}
                  disabled={false}
                  options={[
                    { value: "", label: "Select a new category..." },
                    ...serviceCategories
                      .filter((c) => c.id !== serviceCategory.id && c.deletedAt === null)
                      .map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="archive-service"
              className="block text-sm font-medium text-typography-primary"
            >
              Type "<span className="text-typography-danger">{serviceCategory.name}</span>" to
              confirm {isArchived ? "unarchiving" : "archiving"} this service category.
            </label>
            <input
              id="archive-service"
              value={archiveConfirmation}
              onChange={(e) => setArchiveConfirmation(e.target.value)}
              autoComplete="off"
              className="mt-2 block w-full rounded-md border border-border-dark px-2 py-1 text-xs text-typography-primary"
            />
          </div>
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="primary danger"
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>
      </DialogActions>
    </Modal>
  )
}
