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

type CreateServiceCategoryModalProps = {
  open: boolean
  onClose: () => void
  services: Service[]
  insertServiceCategory: (
    service: Partial<ServiceCategoryWithRelations>
  ) => Promise<ServiceCategoryWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const CreateServiceCategoryModal = ({
  open,
  onClose,
  services,
  insertServiceCategory,
  revalidateTable,
}: CreateServiceCategoryModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceCategoryWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  // initialize form data when the modal opens
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

  if (!formData) return null

  const isArchived = formData.deletedAt !== null
  const isReadonly = isArchived

  const handleSave = async () => {
    if (formData && !isReadonly) {
      try {
        setIsSaving(true)
        await insertServiceCategory(formData)
        await revalidateTable()
        onClose()
        setIsSaving(false)
        window.location.href = "/protected/settings"
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
        <DialogTitle>Create Service Category</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <ServiceCategoryForm
            serviceCategory={formData}
            setFormData={setFormData}
            services={services}
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
