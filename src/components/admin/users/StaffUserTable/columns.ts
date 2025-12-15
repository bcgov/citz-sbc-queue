import type { ColumnConfig } from "@/components/common/datatable"
import type { StaffUser } from "@/generated/prisma/client"

export const columns: ColumnConfig<StaffUser>[] = [
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
