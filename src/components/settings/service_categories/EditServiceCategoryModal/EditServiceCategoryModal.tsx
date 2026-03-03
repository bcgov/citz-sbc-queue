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
import type { Service } from "@/generated/prisma/client"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { ServiceCategoryForm } from "../ServiceCategoryForm"

type EditServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  serviceCategory: ServiceCategoryWithRelations | null
  services: Service[]
  updateServiceCategory: (
    serviceCategory: Partial<ServiceCategoryWithRelations>,
    prevServiceCategory: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const EditServiceCategoryModal = ({
  open,
  onClose,
  serviceCategory,
  services,
  updateServiceCategory,
  revalidateTable,
}: EditServiceCategoryModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ServiceCategoryWithRelations> | null>(null)
  const [previousServiceCategory, setPreviousServiceCategory] =
    useState<Partial<ServiceCategoryWithRelations> | null>(null)
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
      setPreviousServiceCategory(serviceCategory)
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
  }, [formData, previousServiceCategory])

  if (!serviceCategory || !formData || !previousServiceCategory) return null

  const isArchived = serviceCategory.deletedAt !== null
  const isReadonly = isArchived

  const handleSave = async () => {
    if (formData && !isReadonly) {
      setIsSaving(true)
      await updateServiceCategory(formData, previousServiceCategory)
      await revalidateTable()
      onClose()
      setIsSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Category: {serviceCategory.name}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {isReadonly && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              {isArchived && (
                <p className="text-sm font-medium text-red-800">
                  This service category is archived and cannot be edited.
                </p>
              )}
            </div>
          )}

          <ServiceCategoryForm
            serviceCategory={formData}
            services={services}
            setFormData={setFormData}
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
          disabled={isReadonly || isSaving || isFormValidating || !isFormValidState}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
