"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import { useDialog } from "@/hooks/useDialog"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { ConfirmArchiveLocationModal } from "../ConfirmArchiveLocationModal"
import { CreateLocationModal } from "../CreateLocationModal"
import { EditLocationModal } from "../EditLocationModal"
import { columns } from "./columns"

export type LocationTableProps = {
  locations: LocationWithRelations[]
  services: ServiceWithRelations[]
  counters: Counter[]
  staffUsers: StaffUser[]
  updateLocation: (
    location: Partial<LocationWithRelations>,
    prevLocation: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  insertLocation: (
    location: Partial<LocationWithRelations>
  ) => Promise<LocationWithRelations | null>
  doesLocationCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const LocationTable = ({
  locations,
  services,
  counters,
  staffUsers,
  updateLocation,
  insertLocation,
  doesLocationCodeExist,
  revalidateTable,
}: LocationTableProps) => {
  const {
    open: editLocationModalOpen,
    openDialog: openEditLocationModal,
    closeDialog: closeEditLocationModal,
  } = useDialog()
  const {
    open: createLocationModalOpen,
    openDialog: openCreateLocationModal,
    closeDialog: closeCreateLocationModal,
  } = useDialog()
  const {
    open: confirmArchiveLocationModalOpen,
    openDialog: openConfirmArchiveLocationModal,
    closeDialog: closeConfirmArchiveLocationModal,
  } = useDialog()

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationWithRelations | null>(null)

  const handleRowClick = (location: LocationWithRelations) => {
    setSelectedLocation(location)
    openEditLocationModal()
  }

  const locationsToShow = showArchived
    ? locations
    : locations.filter((location) => location.deletedAt === null)

  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        <h3 className="self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
        <button type="button" className="primary" onClick={openCreateLocationModal}>
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
      <EditLocationModal
        open={editLocationModalOpen}
        onClose={closeEditLocationModal}
        location={selectedLocation}
        services={services}
        counters={counters}
        staffUsers={staffUsers}
        updateLocation={updateLocation}
        doesLocationCodeExist={doesLocationCodeExist}
        revalidateTable={revalidateTable}
        openConfirmArchiveLocationModal={openConfirmArchiveLocationModal}
      />
      <CreateLocationModal
        open={createLocationModalOpen}
        onClose={closeCreateLocationModal}
        services={services}
        counters={counters}
        staffUsers={staffUsers}
        insertLocation={insertLocation}
        doesLocationCodeExist={doesLocationCodeExist}
        revalidateTable={revalidateTable}
      />
      <ConfirmArchiveLocationModal
        open={confirmArchiveLocationModalOpen}
        onClose={closeConfirmArchiveLocationModal}
        location={selectedLocation}
        updateLocation={updateLocation}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
