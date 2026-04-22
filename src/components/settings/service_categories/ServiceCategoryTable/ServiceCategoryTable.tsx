"use client"

import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Service } from "@/generated/prisma/client"
import { useServiceCategoryTable } from "@/hooks/settings/service_categories/useServiceCategoryTable"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
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
  const {
    showArchived,
    setShowArchived,
    selectedServiceCategory,
    canCreate,
    canEditSelectedServiceCategory,
    canArchiveSelectedServiceCategory,
    serviceCategoriesToShow,
    handleRowClick,
    editServiceCategoryModalOpen,
    closeEditServiceCategoryModal,
    createServiceCategoryModalOpen,
    openCreateServiceCategoryModal,
    closeCreateServiceCategoryModal,
    confirmArchiveServiceCategoryModalOpen,
    openConfirmArchiveServiceCategoryModal,
    closeConfirmArchiveServiceCategoryModal,
    updateServiceCategory,
    insertServiceCategory,
  } = useServiceCategoryTable({ currentUser, serviceCategories, services, revalidateTable })

  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        <h3 className="self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
        {canCreate && (
          <button type="button" onClick={openCreateServiceCategoryModal} className="primary">
            + Create
          </button>
        )}
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
