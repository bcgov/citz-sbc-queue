"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Service, StaffUser } from "@/generated/prisma/client"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import { columns } from "./columns"

export type LocationTableProps = {
  locations: LocationWithRelations[]
  services: Service[]
  staffUsers: StaffUser[]
  revalidateTable: () => Promise<void>
}

export const LocationTable = ({
  locations,
  services,
  staffUsers,
  revalidateTable,
}: LocationTableProps) => {
  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationWithRelations | null>(null)

  console.log(`Temp log - LocationTable: selectedLocation: ${JSON.stringify(selectedLocation)}`)

  const handleRowClick = (location: LocationWithRelations) => {
    setSelectedLocation(location)
  }

  const locationsToShow = showArchived
    ? locations
    : locations.filter((location) => location.deletedAt === null)

  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        <h3 className="self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
        <button type="button" className="primary">
          + Create
        </button>
      </div>
      <DataTable
        data={locationsToShow}
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
        emptyMessage="No locations found."
        onRowClick={handleRowClick}
      />
    </>
  )
}
