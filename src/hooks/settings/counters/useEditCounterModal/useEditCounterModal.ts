import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"

type UseEditCounterModalProps = {
  open: boolean
  onClose: () => void
  counter: CounterWithRelations | null
  canEdit: boolean
  canDelete: boolean
  updateCounter: (
    counter: Partial<CounterWithRelations>,
    prevCounter: Partial<CounterWithRelations>
  ) => Promise<CounterWithRelations | null>
  revalidateTable: () => Promise<void>
  openConfirmDeleteCounterModal: () => void
}

const EditCounterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  locations: z.array(z.any()),
  staffUsers: z.array(z.any()),
})

/**
 * Custom hook encapsulating all logic for the EditCounterModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.counter - The counter being edited.
 * @property props.canEdit - Whether the current user can edit this counter.
 * @property props.updateCounter - Async function to persist changes.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useEditCounterModal = ({
  open,
  onClose,
  counter,
  canEdit,
  canDelete,
  updateCounter,
  revalidateTable,
  openConfirmDeleteCounterModal,
}: UseEditCounterModalProps) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CounterWithRelations> | null>(null)
  const [previousCounter, setPreviousCounter] = useState<Partial<CounterWithRelations> | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)

  const hasMadeChanges = JSON.stringify(formData) !== JSON.stringify(previousCounter)

  useEffect(() => {
    if (open && counter) {
      setFormData(counter)
      setPreviousCounter(counter)
      setError(null)
    }
  }, [open, counter])

  useEffect(() => {
    if (!formData) {
      setIsFormValid(false)
      return
    }

    const result = EditCounterSchema.safeParse(formData)
    setIsFormValid(result.success)
  }, [formData])

  const isReadonly = !canEdit

  const handleSave = async () => {
    if (formData && previousCounter && !isReadonly) {
      try {
        setIsSaving(true)
        await updateCounter(formData, previousCounter)
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

  const isSaveDisabled = isReadonly || isSaving || !isFormValid || !hasMadeChanges

  const handleOpenDelete = () => {
    openConfirmDeleteCounterModal()
    onClose()
  }

  return {
    isSaving,
    error,
    formData,
    setFormData,
    isReadonly,
    isSaveDisabled,
    canDelete,
    handleSave,
    handleOpenDelete,
  }
}
