import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"

type UseCreateCounterModalProps = {
  open: boolean
  onClose: () => void
  insertCounter: (counter: Partial<CounterWithRelations>) => Promise<CounterWithRelations | null>
  revalidateTable: () => Promise<void>
}

const NewCounterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  locations: z.array(z.any()),
  staffUsers: z.array(z.any()),
})

/**
 * Custom hook encapsulating all logic for the CreateCounterModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.insertCounter - Async function to persist the new counter.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, form data, and handlers for the modal.
 */
export const useCreateCounterModal = ({
  open,
  onClose,
  insertCounter,
  revalidateTable,
}: UseCreateCounterModalProps) => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CounterWithRelations> | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)

  // Initialize form data when the modal opens
  useEffect(() => {
    if (open) {
      setFormData({ name: "", locations: [], staffUsers: [] })
      setError(null)
    } else {
      setFormData(null)
      setIsFormValid(false)
    }
  }, [open])

  useEffect(() => {
    if (!formData) {
      setIsFormValid(false)
      return
    }
    const result = NewCounterSchema.safeParse(formData)
    setIsFormValid(result.success)
  }, [formData])

  const handleSave = async () => {
    if (formData) {
      try {
        setIsSaving(true)
        await insertCounter(formData)
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

  const isSaveDisabled = isSaving || !isFormValid

  return {
    isSaving,
    error,
    formData,
    setFormData,
    isReadonly: false,
    isSaveDisabled,
    handleSave,
  }
}
