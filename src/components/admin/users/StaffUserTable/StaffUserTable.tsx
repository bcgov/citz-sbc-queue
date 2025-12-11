"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch/Switch"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { useDialog } from "@/hooks/useDialog/useDialog"
import { ConfirmArchiveModal } from "../ConfirmArchiveModal"
import { EditStaffUserModal } from "../EditStaffUserModal"
import { columns } from "./columns"

export type StaffUserTableProps = {
  users: StaffUser[]
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles: Role[]
  ) => Promise<StaffUser | null>
  revalidateTable: () => Promise<void>
}

export const StaffUserTable = ({
  users,
  updateStaffUser,
  revalidateTable,
}: StaffUserTableProps) => {
  const {
    open: editUserModalOpen,
    openDialog: openEditUserModal,
    closeDialog: closeEditUserModal,
  } = useDialog()
  const {
    open: confirmArchiveModalOpen,
    openDialog: openConfirmArchiveModal,
    closeDialog: closeConfirmArchiveModal,
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
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
        openConfirmArchiveModal={openConfirmArchiveModal}
      />
      <ConfirmArchiveModal
        open={confirmArchiveModalOpen}
        onClose={closeConfirmArchiveModal}
        user={selectedUser}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
