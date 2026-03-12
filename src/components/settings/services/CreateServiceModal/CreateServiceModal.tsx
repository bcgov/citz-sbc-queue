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

type CreateServiceModalProps = {
  open: boolean
  onClose: () => void
  locations: LocationWithRelations[]
  categories: ServiceCategoryWithRelations[]
  insertService: (service: Partial<ServiceWithRelations>) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const CreateServiceModal = ({
  open,
  onClose,
  locations,
  categories,
  insertService,
  doesServiceCodeExist,
  revalidateTable,
}: CreateServiceModalProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceWithRelations> | null>(null)
  const [isFormValidState, setIsFormValidState] = useState<boolean>(false)
  const [isFormValidating, setIsFormValidating] = useState<boolean>(false)

  // initialize form data when the modal opens
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

  if (!formData) return null

  const isArchived = formData.deletedAt !== null
  const isReadonly = isArchived

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

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <DialogHeader trailing={<CloseButton onClick={onClose} />}>
        <DialogTitle>Create Service</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <form className="space-y-5">
          {error && (
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-l-red-600 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
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
