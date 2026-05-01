import { useEffect, useMemo, useState } from "react"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"

type UseStaffUserTableProps = {
  currentUser: StaffUserWithRelations | null
  users: StaffUser[]
  locations: Location[]
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the StaffUserTable component.
 *
 * @param props - Hook configuration.
 * @property props.currentUser - The currently authenticated staff user.
 * @property props.users - Full list of staff users.
 * @property props.locations - Full list of locations.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived values, and handlers for the table and its modals.
 */
export const useStaffUserTable = ({ currentUser, users }: UseStaffUserTableProps) => {
  const { role, idir_user_guid } = useAuth()

  const {
    open: editUserModalOpen,
    openDialog: openEditUserModal,
    closeDialog: closeEditUserModal,
  } = useDialog()
  const {
    open: confirmArchiveUserModalOpen,
    openDialog: openConfirmArchiveUserModal,
    closeDialog: closeConfirmArchiveUserModal,
  } = useDialog()

  const userContext = useMemo<UserContext>(
    () => ({
      staff_user_id: idir_user_guid ?? null,
      role,
      location_code: currentUser?.locationCode ?? null,
    }),
    [idir_user_guid, role, currentUser?.locationCode]
  )

  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null)
  const [canEditSelectedUser, setCanEditSelectedUser] = useState<boolean>(false)
  const [canArchiveSelectedUser, setCanArchiveSelectedUser] = useState<boolean>(false)
  const [canEditLocationSelectedUser, setCanEditLocationSelectedUser] = useState<boolean>(false)
  const [availableRolesForSelectedUser, setAvailableRolesForSelectedUser] = useState<Role[]>([])
  const [showArchived, setShowArchived] = useState<boolean>(false)

  // Determine if the current user can edit/archive the selected user whenever either changes
  useEffect(() => {
    if (selectedUser) {
      const actions = resolvePolicy("staff_user", userContext, selectedUser)
      setCanEditSelectedUser(actions.includes("edit"))
      setCanArchiveSelectedUser(actions.includes("archive"))
      setCanEditLocationSelectedUser(actions.includes("change_location"))

      // Extract available roles from change_role_to_ actions
      const availableRoles = actions
        .filter((action) => action.startsWith("change_role_to_"))
        .map((action) => action.replace("change_role_to_", "") as Role)

      setAvailableRolesForSelectedUser(availableRoles)
    } else {
      setCanEditSelectedUser(false)
      setCanArchiveSelectedUser(false)
      setCanEditLocationSelectedUser(false)
      setAvailableRolesForSelectedUser([])
    }
  }, [selectedUser, userContext])

  const handleRowClick = (user: StaffUser) => {
    setSelectedUser(user)
    openEditUserModal()
  }

  const usersToShow = users.filter((user) => {
    if (!showArchived && user.deletedAt !== null) return false
    const actions = resolvePolicy("staff_user", userContext, user)
    return actions.includes("view")
  })

  return {
    showArchived,
    setShowArchived,
    selectedUser,
    canEditSelectedUser,
    canArchiveSelectedUser,
    canEditLocationSelectedUser,
    availableRolesForSelectedUser,
    usersToShow,
    handleRowClick,
    editUserModalOpen,
    closeEditUserModal,
    confirmArchiveUserModalOpen,
    openConfirmArchiveUserModal,
    closeConfirmArchiveUserModal,
  }
}
