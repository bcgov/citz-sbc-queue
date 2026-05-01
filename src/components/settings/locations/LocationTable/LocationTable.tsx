"use client"

import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import { useLocationTable } from "@/hooks/settings/locations/useLocationTable"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { ConfirmArchiveLocationModal } from "../ConfirmArchiveLocationModal"
import { CreateLocationModal } from "../CreateLocationModal"
import { EditLocationModal } from "../EditLocationModal"
import { columns } from "./columns"

export type LocationTableProps = {
  currentUser: StaffUserWithRelations | null
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
  currentUser,
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
    showArchived,
    setShowArchived,
    selectedLocation,
    canCreate,
    canEditSelectedLocation,
    canArchiveSelectedLocation,
    locationsToShow,
    handleRowClick,
    editLocationModalOpen,
    closeEditLocationModal,
    createLocationModalOpen,
    openCreateLocationModal,
    closeCreateLocationModal,
    confirmArchiveLocationModalOpen,
    openConfirmArchiveLocationModal,
    closeConfirmArchiveLocationModal,
  } = useLocationTable({
    currentUser,
    locations,
    services,
    counters,
    staffUsers,
    updateLocation,
    insertLocation,
    doesLocationCodeExist,
    revalidateTable,
  })

  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        <h3 className="self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
        {canCreate && (
          <button type="button" className="primary" onClick={openCreateLocationModal}>
            + Create
          </button>
        )}
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
        canEdit={canEditSelectedLocation}
        canArchive={canArchiveSelectedLocation}
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
