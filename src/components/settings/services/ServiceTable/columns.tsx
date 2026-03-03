import type { ColumnConfig } from "@/components/common/datatable"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

export const columns: ColumnConfig<ServiceWithRelations>[] = [
  {
    key: "code",
    label: "Code",
    sortable: true,
    searchable: true,
    render: (value, row) => {
      return (
        <span className={row.deletedAt ? "text-typography-danger" : ""}>{value as string}</span>
      )
    },
  },
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
    key: "publicName",
    label: "Public Name",
    sortable: true,
    searchable: true,
    render: (value, row) => {
      return (
        <span className={row.deletedAt ? "text-typography-danger" : ""}>{value as string}</span>
      )
    },
  },
  {
    key: "ticketPrefix",
    label: "Ticket Prefix",
    sortable: true,
    searchable: true,
    render: (value, row) => {
      return (
        <span className={row.deletedAt ? "text-typography-danger" : ""}>{value as string}</span>
      )
    },
  },
  {
    key: "backOffice",
    label: "Back Office",
    render: (value, row) => {
      return (
        <span className={row.deletedAt ? "text-typography-danger" : ""}>
          {value ? "Yes" : "No"}
        </span>
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
