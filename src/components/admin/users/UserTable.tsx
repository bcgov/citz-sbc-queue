"use client"

import { useState } from "react"
import { type ColumnConfig, DataTable } from "@/components/common/datatable"
import type { Role, StaffUser } from "@/generated/prisma/client"
import { useDialog } from "@/hooks/useDialog/useDialog"
import { ConfirmArchiveModal } from "./edit/ConfirmArchiveModal"
import { EditUserModal } from "./edit/EditUserModal"

export type UserTableProps = {
  users: StaffUser[]
  updateStaffUser: (
    user: Partial<StaffUser>,
    prevUser: Partial<StaffUser>,
    availableRoles: Role[]
  ) => Promise<StaffUser | null>
  revalidateTable: () => Promise<void>
}

export const UserTable = ({ users, updateStaffUser, revalidateTable }: UserTableProps) => {
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

  const columns: ColumnConfig<StaffUser>[] = [
    {
      key: "displayName",
      label: "Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "username",
      label: "Username",
      sortable: true,
      searchable: true,
    },
    {
      key: "role",
      label: "Role",
      searchable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value): string => {
        if (value instanceof Date) {
          return value.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        }
        return new Date(value as string).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      },
    },
  ]

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
      <EditUserModal
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
