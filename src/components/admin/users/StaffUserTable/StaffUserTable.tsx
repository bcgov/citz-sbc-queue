"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import type { Location, Role, StaffUser } from "@/generated/prisma/client"
import { useDialog } from "@/hooks/useDialog/useDialog"
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
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null)

  const handleRowClick = (user: StaffUser) => {
    setSelectedUser(user)
    openEditUserModal()
  }

  return (
    <>
      <DataTable
        data={users}
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
      />
    </>
  )
}
