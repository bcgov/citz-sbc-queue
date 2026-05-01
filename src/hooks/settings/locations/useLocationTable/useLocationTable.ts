import { useEffect, useMemo, useState } from "react"
import type { Counter, StaffUser } from "@/generated/prisma/client"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"

type UseLocationTableProps = {
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

/**
 * Custom hook encapsulating all logic for the LocationTable component.
 *
 * @param props - Hook configuration.
 * @property props.currentUser - The currently authenticated staff user.
 * @property props.locations - Full list of locations.
 * @property props.services - Full list of services.
 * @property props.counters - Full list of counters.
 * @property props.staffUsers - Full list of staff users.
 * @property props.updateLocation - Async function to update an existing location.
 * @property props.insertLocation - Async function to create a new location.
 * @property props.doesLocationCodeExist - Async function to check if a location code is already taken.
 * @property props.revalidateTable - Async function to refresh the table data.
 * @returns State, derived values, dialog controls, and handlers for the table.
 */
export const useLocationTable = ({
  currentUser,
  locations,
  services,
  counters,
  staffUsers,
  updateLocation,
  insertLocation,
  doesLocationCodeExist,
  revalidateTable,
}: UseLocationTableProps) => {
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
  const canCreate = actions.includes("create")

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationWithRelations | null>(null)
  const [canEditSelectedLocation, setCanEditSelectedLocation] = useState<boolean>(false)
  const [canArchiveSelectedLocation, setCanArchiveSelectedLocation] = useState<boolean>(false)

  // Determine if the current user can edit/archive the selected location whenever either changes
  useEffect(() => {
    if (selectedLocation) {
      const locationActions = resolvePolicy("location", userContext, selectedLocation)
      setCanEditSelectedLocation(locationActions.includes("edit"))
      setCanArchiveSelectedLocation(locationActions.includes("archive"))
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
    if (!showArchived && location.deletedAt !== null) return false
    const locationActions = resolvePolicy("location", userContext, location)
    return locationActions.includes("view")
  })

  return {
    showArchived,
    setShowArchived,
    selectedLocation,
    canCreate,
    canEditSelectedLocation,
    canArchiveSelectedLocation,
    locationsToShow,
    handleRowClick,
    editLocationModalOpen,
    openEditLocationModal,
    closeEditLocationModal,
    createLocationModalOpen,
    openCreateLocationModal,
    closeCreateLocationModal,
    confirmArchiveLocationModalOpen,
    openConfirmArchiveLocationModal,
    closeConfirmArchiveLocationModal,
    // Pass-through props needed by modals
    services,
    counters,
    staffUsers,
    updateLocation,
    insertLocation,
    doesLocationCodeExist,
    revalidateTable,
  }
}
