import type { ColumnConfig } from "@/components/common/datatable"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"

export const columns: ColumnConfig<CounterWithRelations>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    render: (value) => {
      return <span>{value as string}</span>
    },
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (value) => {
      if (value instanceof Date) {
        return (
          <span>
            {value.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )
      }
      return (
        <span>
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
