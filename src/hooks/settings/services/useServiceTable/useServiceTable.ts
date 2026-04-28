import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"

type UseServiceTableProps = {
  currentUser: StaffUserWithRelations | null
  services: ServiceWithRelations[]
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the ServiceTable component.
 *
 * @param props - Hook configuration.
 * @property props.currentUser - The currently authenticated staff user.
 * @property props.services - Full list of services.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived values, and handlers for the table and its modals.
 */
export const useServiceTable = ({ currentUser, services }: UseServiceTableProps) => {
  const { role, idir_user_guid } = useAuth()

  const {
    open: editServiceModalOpen,
    openDialog: openEditServiceModal,
    closeDialog: closeEditServiceModal,
  } = useDialog()
  const {
    open: createServiceModalOpen,
    openDialog: openCreateServiceModal,
    closeDialog: closeCreateServiceModal,
  } = useDialog()
  const {
    open: confirmArchiveServiceModalOpen,
    openDialog: openConfirmArchiveServiceModal,
    closeDialog: closeConfirmArchiveServiceModal,
  } = useDialog()

  const userContext = useMemo<UserContext>(
    () => ({
      staff_user_id: idir_user_guid ?? null,
      role,
      location_code: currentUser?.locationCode ?? null,
    }),
    [idir_user_guid, role, currentUser?.locationCode]
  )

  const actions = resolvePolicy("service", userContext)

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null)
  const [canEditSelectedService, setCanEditSelectedService] = useState<boolean>(false)
  const [canArchiveSelectedService, setCanArchiveSelectedService] = useState<boolean>(false)

  // Determine if the current user can edit/archive the selected service whenever either changes
  useEffect(() => {
    if (selectedService) {
      const serviceActions = resolvePolicy("service", userContext, selectedService)
      setCanEditSelectedService(serviceActions.includes("edit"))
      setCanArchiveSelectedService(serviceActions.includes("archive"))
    } else {
      setCanEditSelectedService(false)
      setCanArchiveSelectedService(false)
    }
  }, [selectedService, userContext])

  const handleRowClick = (service: ServiceWithRelations) => {
    setSelectedService(service)
    openEditServiceModal()
  }

  const servicesToShow = services.filter((service) => {
    if (!showArchived && service.deletedAt !== null) return false
    const serviceActions = resolvePolicy("service", userContext, service)
    return serviceActions.includes("view")
  })

  const canCreate = actions.includes("create")

  return {
    showArchived,
    setShowArchived,
    selectedService,
    canCreate,
    canEditSelectedService,
    canArchiveSelectedService,
    servicesToShow,
    handleRowClick,
    editServiceModalOpen,
    openEditServiceModal,
    closeEditServiceModal,
    createServiceModalOpen,
    openCreateServiceModal,
    closeCreateServiceModal,
    confirmArchiveServiceModalOpen,
    openConfirmArchiveServiceModal,
    closeConfirmArchiveServiceModal,
  }
}
