"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { useDialog } from "@/hooks/useDialog/useDialog"
import { ConfirmArchiveUserModal } from "../ConfirmArchiveUserModal"
import { EditStaffUserModal } from "../EditStaffUserModal"
import { columns } from "./columns"

export type UserTableProps = {
  users: StaffUser[]
  offices: Location[]
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles: Role[]
  ) => Promise<StaffUser | null>
  revalidateTable: () => Promise<void>
}

export const StaffUserTable = ({
  users,
  offices,
  updateStaffUser,
  revalidateTable,
}: UserTableProps) => {
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

  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null)
  const [showArchived, setShowArchived] = useState<boolean>(false)

  const handleRowClick = (user: StaffUser) => {
    setSelectedUser(user)
    openEditUserModal()
  }

  const usersToShow = showArchived ? users : users.filter((user) => user.deletedAt === null)

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
        offices={offices}
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
