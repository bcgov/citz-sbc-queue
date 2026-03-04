import type { ColumnConfig } from "@/components/common/datatable"
import type { LocationWithRelations } from "@/lib/prisma/location/types"

export const columns: ColumnConfig<LocationWithRelations>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    render: (value, row) => {
      return (
        <span className={row.deletedAt ? "text-typography-danger" : ""}>{value as string}</span>
      )
    },
  },
  {
    key: "streetAddress",
    label: "Street Address",
    sortable: true,
    searchable: true,
    render: (value, row) => {
      return (
        <span className={row.deletedAt ? "text-typography-danger" : ""}>{value as string}</span>
      )
    },
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (value, row) => {
      if (value instanceof Date) {
        return (
          <span className={row.deletedAt ? "text-typography-danger" : ""}>
            {value.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )
      }
      return (
        <span className={row.deletedAt ? "text-typography-danger" : ""}>
          {new Date(value as string).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      )
    },
  },
]
