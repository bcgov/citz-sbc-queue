"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Service } from "@/generated/prisma/client"
import { columns } from "./columns"

export type ServiceTableProps = {
  services: Service[]
}

export const ServiceTable = ({ services }: ServiceTableProps) => {
  const [showArchived, setShowArchived] = useState<boolean>(false)

  const servicesToShow = showArchived
    ? services
    : services.filter((service) => service.deletedAt === null)
  return (
    <>
      <div className="flex justify-end mb-3">
        <h3 className="mr-2 self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
      </div>
      <DataTable
        data={servicesToShow}
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
        emptyMessage="No services found."
      />
    </>
  )
}
