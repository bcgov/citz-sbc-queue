import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"

type UseCounterTableProps = {
  currentUser: StaffUserWithRelations | null
  counters: CounterWithRelations[]
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the CounterTable component.
 *
 * @param props - Hook configuration.
 * @property props.currentUser - The currently authenticated staff user.
 * @property props.counters - Full list of counters.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived values, and handlers for the table and its modals.
 */
export const useCounterTable = ({ currentUser, counters }: UseCounterTableProps) => {
  const { role, idir_user_guid } = useAuth()

  const {
    open: editCounterModalOpen,
    openDialog: openEditCounterModal,
    closeDialog: closeEditCounterModal,
  } = useDialog()
  const {
    open: createCounterModalOpen,
    openDialog: openCreateCounterModal,
    closeDialog: closeCreateCounterModal,
  } = useDialog()
  const {
    open: deleteCounterModalOpen,
    openDialog: openDeleteCounterModal,
    closeDialog: closeDeleteCounterModal,
  } = useDialog()

  const userContext = useMemo<UserContext>(
    () => ({
      staff_user_id: idir_user_guid ?? null,
      role,
      location_code: currentUser?.locationCode ?? null,
    }),
    [idir_user_guid, role, currentUser?.locationCode]
  )

  const actions = resolvePolicy("counter", userContext)
  const canCreate = actions.includes("create")

  const [selectedCounter, setSelectedCounter] = useState<CounterWithRelations | null>(null)
  const [canEditSelectedCounter, setCanEditSelectedCounter] = useState<boolean>(false)
  const [canDeleteSelectedCounter, setCanDeleteSelectedCounter] = useState<boolean>(false)

  // Determine if the current user can edit/delete the selected counter whenever either changes
  useEffect(() => {
    if (selectedCounter) {
      const counterActions = resolvePolicy("counter", userContext, selectedCounter)
      setCanEditSelectedCounter(counterActions.includes("edit"))
      setCanDeleteSelectedCounter(counterActions.includes("delete"))
    } else {
      setCanEditSelectedCounter(false)
      setCanDeleteSelectedCounter(false)
    }
  }, [selectedCounter, userContext])

  const handleRowClick = (counter: CounterWithRelations) => {
    setSelectedCounter(counter)
    openEditCounterModal()
  }

  const countersToShow = counters.filter((counter) => {
    const counterActions = resolvePolicy("counter", userContext, counter)
    return counterActions.includes("view")
  })

  return {
    selectedCounter,
    canCreate,
    canEditSelectedCounter,
    canDeleteSelectedCounter,
    countersToShow,
    handleRowClick,
    editCounterModalOpen,
    openEditCounterModal,
    closeEditCounterModal,
    createCounterModalOpen,
    openCreateCounterModal,
    closeCreateCounterModal,
    deleteCounterModalOpen,
    openDeleteCounterModal,
    closeDeleteCounterModal,
  }
}
