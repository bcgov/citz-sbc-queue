import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"

type UseConfirmDeleteCounterModalProps = {
  open: boolean
  onClose: () => void
  counter: CounterWithRelations | null
  deleteCounter: (id: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the ConfirmDeleteCounterModal component.
 *
 * @param props - Hook configuration.
 * @property props.open - Whether the modal is open.
 * @property props.onClose - Callback to close the modal.
 * @property props.counter - The counter to delete.
 * @property props.deleteCounter - Async function to delete the counter.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived flags, and handlers for the modal.
 */
export const useConfirmDeleteCounterModal = ({
  open,
  onClose,
  counter,
  deleteCounter,
  revalidateTable,
}: UseConfirmDeleteCounterModalProps) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  useEffect(() => {
    if (open) {
      setDeleteConfirmation("")
      setError(null)
    }
  }, [open])

  const handleDelete = async () => {
    if (!counter) return
    try {
      await deleteCounter(counter.id)
      await revalidateTable()
      setDeleteConfirmation("")
      onClose()
      router.refresh()
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  const isDeleteDisabled = deleteConfirmation !== counter?.name

  return {
    error,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleteDisabled,
    handleDelete,
  }
}
