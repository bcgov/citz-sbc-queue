"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Service } from "@/generated/prisma/client"
import { useDialog } from "@/hooks/useDialog"
import { insertServiceCategory } from "@/lib/prisma/service_category/insertServiceCategory"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { updateServiceCategory } from "@/lib/prisma/service_category/updateServiceCategory"
import { CreateServiceCategoryModal } from "../CreateServiceCategoryModal"
import { EditServiceCategoryModal } from "../EditServiceCategoryModal"
import { columns } from "./columns"

export type ServiceCategoryTableProps = {
  serviceCategories: ServiceCategoryWithRelations[]
  services: Service[]
  revalidateTable: () => Promise<void>
}

export const ServiceCategoryTable = ({
  serviceCategories,
  services,
  revalidateTable,
}: ServiceCategoryTableProps) => {
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

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedServiceCategory, setSelectedServiceCategory] =
    useState<ServiceCategoryWithRelations | null>(null)

  console.log(`Temp log for lint resolution: ${selectedServiceCategory}`)

  const handleRowClick = (serviceCategory: ServiceCategoryWithRelations) => {
    setSelectedServiceCategory(serviceCategory)
    openEditServiceCategoryModal()
  }

  const serviceCategoriesToShow = showArchived
    ? serviceCategories
    : serviceCategories.filter((serviceCategory) => serviceCategory.deletedAt === null)
  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        <h3 className="self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
        <button type="button" onClick={openCreateServiceCategoryModal} className="primary">
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
      />
      <CreateServiceCategoryModal
        open={createServiceCategoryModalOpen}
        onClose={closeCreateServiceCategoryModal}
        services={services}
        insertServiceCategory={insertServiceCategory}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
