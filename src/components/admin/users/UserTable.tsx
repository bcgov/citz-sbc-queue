"use client"

import { type ColumnConfig, DataTable } from "@/components/common/datatable"
import type { StaffUser } from "@/generated/prisma/client"

export type UserTableProps = {
  users: StaffUser[]
  onRowClick?: (user: StaffUser) => void
}

export const UserTable = ({ users, onRowClick }: UserTableProps) => {
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

  return (
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
      onRowClick={onRowClick}
    />
  )
}
