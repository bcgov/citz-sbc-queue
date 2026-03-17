"use client"

import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog/useDialog"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"
import { ConfirmArchiveUserModal } from "../ConfirmArchiveUserModal"
import { EditStaffUserModal } from "../EditStaffUserModal"
import { columns } from "./columns"

export type UserTableProps = {
  currentUser: StaffUserWithRelations | null
  users: StaffUser[]
  locations: Location[]
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles?: Role[]
  ) => Promise<StaffUser | null>
  revalidateTable: () => Promise<void>
}

export const StaffUserTable = ({
  currentUser,
  users,
  locations,
  updateStaffUser,
  revalidateTable,
}: UserTableProps) => {
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
  const [availableRolesForSelectedUser, setAvailableRolesForSelectedUser] = useState<Role[]>([])
  const [showArchived, setShowArchived] = useState<boolean>(false)

  // Determine if the current user can edit/archive the selected user whenever either changes
  useEffect(() => {
    if (selectedUser) {
      const actions = resolvePolicy("staff_user", userContext, selectedUser)
      setCanEditSelectedUser(actions.includes("edit"))
      setCanArchiveSelectedUser(actions.includes("archive"))

      // Extract available roles from change_role_to_ actions
      const availableRoles = actions
        .filter((action) => action.startsWith("change_role_to_"))
        .map((action) => action.replace("change_role_to_", "") as Role)

      setAvailableRolesForSelectedUser(availableRoles)
    } else {
      setCanEditSelectedUser(false)
      setCanArchiveSelectedUser(false)
      setAvailableRolesForSelectedUser([])
    }
  }, [selectedUser, userContext])

  const handleRowClick = (user: StaffUser) => {
    setSelectedUser(user)
    openEditUserModal()
  }

  const usersToShow = users.filter((user) => {
    // Filter by archived status
    if (!showArchived && user.deletedAt !== null) return false

    // Filter by view permission
    const actions = resolvePolicy("staff_user", userContext, user)
    return actions.includes("view")
  })

  return (
    <>
      <div className="flex justify-end mb-3">
        <h3 className="mr-2 self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
      </div>
      <DataTable
        data={usersToShow}
        columns={columns}
        search={{
          enabled: true,
          debounceMs: 300,
        }}
        pagination={{
          enabled: true,
          pageSize: 50,
        }}
        sticky
        emptyMessage="No users found."
        onRowClick={handleRowClick}
      />
      <EditStaffUserModal
        open={editUserModalOpen}
        onClose={closeEditUserModal}
        user={selectedUser}
        canEdit={canEditSelectedUser}
        canArchive={canArchiveSelectedUser}
        availableRoles={availableRolesForSelectedUser}
        locations={locations}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
        openConfirmArchiveUserModal={openConfirmArchiveUserModal}
      />
      <ConfirmArchiveUserModal
        open={confirmArchiveUserModalOpen}
        onClose={closeConfirmArchiveUserModal}
        user={selectedUser}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
