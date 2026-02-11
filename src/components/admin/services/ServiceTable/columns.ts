import type { ColumnConfig } from "@/components/common/datatable"
import type { Service } from "@/generated/prisma/client"

export const columns: ColumnConfig<Service>[] = [
  {
    key: "code",
    label: "Code",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "publicName",
    label: "Public Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "ticketPrefix",
    label: "Ticket Prefix",
    sortable: true,
    searchable: true,
  },
  {
    key: "backOffice",
    label: "Back Office",
    render: (value): string => (value ? "Yes" : "No"),
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
