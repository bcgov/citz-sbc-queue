"use client"

import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Service } from "@/generated/prisma/client"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import { insertServiceCategory } from "@/lib/prisma/service_category/insertServiceCategory"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { updateServiceCategory } from "@/lib/prisma/service_category/updateServiceCategory"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"
import { ConfirmArchiveServiceCategoryModal } from "../ConfirmArchiveServiceCategoryModal"
import { CreateServiceCategoryModal } from "../CreateServiceCategoryModal"
import { EditServiceCategoryModal } from "../EditServiceCategoryModal"
import { columns } from "./columns"

export type ServiceCategoryTableProps = {
  currentUser: StaffUserWithRelations | null
  serviceCategories: ServiceCategoryWithRelations[]
  services: Service[]
  revalidateTable: () => Promise<void>
}

export const ServiceCategoryTable = ({
  currentUser,
  serviceCategories,
  services,
  revalidateTable,
}: ServiceCategoryTableProps) => {
  const { role, idir_user_guid } = useAuth()
  const {
    open: editServiceCategoryModalOpen,
    openDialog: openEditServiceCategoryModal,
    closeDialog: closeEditServiceCategoryModal,
  } = useDialog()
  const {
    open: createServiceCategoryModalOpen,
    openDialog: openCreateServiceCategoryModal,
    closeDialog: closeCreateServiceCategoryModal,
  } = useDialog()
  const {
    open: confirmArchiveServiceCategoryModalOpen,
    openDialog: openConfirmArchiveServiceCategoryModal,
    closeDialog: closeConfirmArchiveServiceCategoryModal,
  } = useDialog()

  const userContext = useMemo<UserContext>(
    () => ({
      staff_user_id: idir_user_guid ?? null,
      role,
      location_code: currentUser?.locationCode ?? null,
    }),
    [idir_user_guid, role, currentUser?.locationCode]
  )

  const actions = resolvePolicy("service_category", userContext)

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedServiceCategory, setSelectedServiceCategory] =
    useState<ServiceCategoryWithRelations | null>(null)
  const [canEditSelectedServiceCategory, setCanEditSelectedServiceCategory] =
    useState<boolean>(false)
  const [canArchiveSelectedServiceCategory, setCanArchiveSelectedServiceCategory] =
    useState<boolean>(false)

  // Determine if the current user can edit/archive the selected service category whenever either changes
  useEffect(() => {
    if (selectedServiceCategory) {
      const actions = resolvePolicy("service_category", userContext, selectedServiceCategory)
      setCanEditSelectedServiceCategory(actions.includes("edit"))
      setCanArchiveSelectedServiceCategory(actions.includes("archive"))
    } else {
      setCanEditSelectedServiceCategory(false)
      setCanArchiveSelectedServiceCategory(false)
    }
  }, [selectedServiceCategory, userContext])

  const handleRowClick = (serviceCategory: ServiceCategoryWithRelations) => {
    setSelectedServiceCategory(serviceCategory)
    openEditServiceCategoryModal()
  }

  const serviceCategoriesToShow = serviceCategories.filter((serviceCategory) => {
    // Filter by archived status
    if (!showArchived && serviceCategory.deletedAt !== null) return false

    // Filter by view permission
    const actions = resolvePolicy("service_category", userContext, serviceCategory)
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
          onClick={openCreateServiceCategoryModal}
          disabled={!canCreate}
          className="primary"
        >
          + Create
        </button>
      </div>
      <DataTable
        data={serviceCategoriesToShow}
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
        emptyMessage="No service categories found."
        onRowClick={handleRowClick}
      />
      <EditServiceCategoryModal
        open={editServiceCategoryModalOpen}
        onClose={closeEditServiceCategoryModal}
        serviceCategory={selectedServiceCategory}
        services={services}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceCategoryModal={openConfirmArchiveServiceCategoryModal}
        canEdit={canEditSelectedServiceCategory}
        canArchive={canArchiveSelectedServiceCategory}
      />
      <CreateServiceCategoryModal
        open={createServiceCategoryModalOpen}
        onClose={closeCreateServiceCategoryModal}
        services={services}
        insertServiceCategory={insertServiceCategory}
        revalidateTable={revalidateTable}
      />
      <ConfirmArchiveServiceCategoryModal
        open={confirmArchiveServiceCategoryModalOpen}
        onClose={closeConfirmArchiveServiceCategoryModal}
        serviceCategory={selectedServiceCategory}
        serviceCategories={serviceCategories}
        updateServiceCategory={updateServiceCategory}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
