"use client"

import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import { useAuth, useDialog } from "@/hooks"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"
import { ConfirmArchiveServiceModal } from "../ConfirmArchiveServiceModal"
import { CreateServiceModal } from "../CreateServiceModal"
import { EditServiceModal } from "../EditServiceModal"
import { columns } from "./columns"

export type ServiceTableProps = {
  currentUser: StaffUserWithRelations | null
  services: ServiceWithRelations[]
  locations: LocationWithRelations[]
  categories: ServiceCategoryWithRelations[]
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  insertService: (service: Partial<ServiceWithRelations>) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const ServiceTable = ({
  currentUser,
  services,
  locations,
  categories,
  updateService,
  insertService,
  doesServiceCodeExist,
  revalidateTable,
}: ServiceTableProps) => {
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
      const actions = resolvePolicy("service", userContext, selectedService)
      setCanEditSelectedService(actions.includes("edit"))
      setCanArchiveSelectedService(actions.includes("archive"))
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
    // Filter by archived status
    if (!showArchived && service.deletedAt !== null) return false

    // Filter by view permission
    const actions = resolvePolicy("service", userContext, service)
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
          onClick={openCreateServiceModal}
          className="primary"
          disabled={!canCreate}
        >
          + Create
        </button>
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
        onRowClick={handleRowClick}
      />
      <EditServiceModal
        open={editServiceModalOpen}
        onClose={closeEditServiceModal}
        service={selectedService}
        locations={locations}
        categories={categories}
        canEdit={canEditSelectedService}
        canArchive={canArchiveSelectedService}
        updateService={updateService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceModal={openConfirmArchiveServiceModal}
      />
      <CreateServiceModal
        open={createServiceModalOpen}
        onClose={closeCreateServiceModal}
        locations={locations}
        categories={categories}
        insertService={insertService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
      />
      <ConfirmArchiveServiceModal
        open={confirmArchiveServiceModalOpen}
        onClose={closeConfirmArchiveServiceModal}
        service={selectedService}
        updateService={updateService}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
