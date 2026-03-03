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
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { ServiceForm } from "../ServiceForm"

type EditServiceModalProps = {
  open: boolean
  onClose: () => void
  service: ServiceWithRelations | null
  locations: LocationWithRelations[]
  categories: ServiceCategoryWithRelations[]
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
  openConfirmArchiveServiceModal: () => void
}

export const EditServiceModal = ({
  open,
  onClose,
  service,
  locations,
  categories,
  updateService,
  doesServiceCodeExist,
  revalidateTable,
  openConfirmArchiveServiceModal,
}: EditServiceModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
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

  if (!service || !formData || !previousService) return null

  const isArchived = service.deletedAt !== null
  const isReadonly = isArchived

  const handleSave = async () => {
    if (formData && !isReadonly) {
      setIsSaving(true)
      await updateService(formData, previousService)
      await revalidateTable()
      onClose()
      setIsSaving(false)
    }
  }

  const handleOpenArchive = () => {
    openConfirmArchiveServiceModal()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Edit Service: {service.code}</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {isReadonly && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              {isArchived && (
                <p className="text-sm font-medium text-red-800">
                  This service is archived and cannot be edited.
                </p>
              )}
            </div>
          )}

          <ServiceForm
            service={formData}
            locations={locations}
            categories={categories}
            setFormData={setFormData}
            doesServiceCodeExist={doesServiceCodeExist}
            isReadonly={isReadonly}
          />
        </form>
      </DialogBody>

      <DialogActions>
        <button type="button" className="tertiary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="secondary danger" onClick={handleOpenArchive}>
          {isArchived ? "Unarchive" : "Archive"}
        </button>
        <button
          type="button"
          className="primary"
          onClick={handleSave}
          disabled={
            isReadonly || isSaving || isFormValidating || !isFormValidState || !hasMadeChanges
          }
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </DialogActions>
    </Modal>
  )
}
