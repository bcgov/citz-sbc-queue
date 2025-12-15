"use client"

import { DataTable } from "@/components/common/datatable"
import type { StaffUser } from "@/generated/prisma/client"
import { columns } from "./columns"

export type UserTableProps = {
  users: StaffUser[]
  onRowClick?: (user: StaffUser) => void
}

export const StaffUserTable = ({ users, onRowClick }: UserTableProps) => {
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
