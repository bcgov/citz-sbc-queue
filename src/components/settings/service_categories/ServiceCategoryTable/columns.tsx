import type { ColumnConfig } from "@/components/common/datatable"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"

export const columns: ColumnConfig<ServiceCategoryWithRelations>[] = [
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
