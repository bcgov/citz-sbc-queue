"use client"

import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"
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
  const { role, idir_user_guid } = useAuth()
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

  const userContext = useMemo<UserContext>(
    () => ({
      staff_user_id: idir_user_guid ?? null,
      role,
      location_code: currentUser?.locationCode ?? null,
    }),
    [idir_user_guid, role, currentUser?.locationCode]
  )

  const actions = resolvePolicy("location", userContext)

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationWithRelations | null>(null)
  const [canEditSelectedLocation, setCanEditSelectedLocation] = useState<boolean>(false)
  const [canArchiveSelectedLocation, setCanArchiveSelectedLocation] = useState<boolean>(false)

  // Determine if the current user can edit/archive the selected location whenever either changes
  useEffect(() => {
    if (selectedLocation) {
      const actions = resolvePolicy("location", userContext, selectedLocation)
      setCanEditSelectedLocation(actions.includes("edit"))
      setCanArchiveSelectedLocation(actions.includes("archive"))
    } else {
      setCanEditSelectedLocation(false)
      setCanArchiveSelectedLocation(false)
    }
  }, [selectedLocation, userContext])

  const handleRowClick = (location: LocationWithRelations) => {
    setSelectedLocation(location)
    openEditLocationModal()
  }

  const locationsToShow = locations.filter((location) => {
    // Filter by archived status
    if (!showArchived && location.deletedAt !== null) return false

    // Filter by view permission
    const actions = resolvePolicy("location", userContext, location)
    return actions.includes("view")
  })

  const canCreate = actions.includes("create")

  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        <h3 className="self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
        <button
          type="button"
          className="primary"
          onClick={openCreateLocationModal}
          disabled={!canCreate}
        >
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
