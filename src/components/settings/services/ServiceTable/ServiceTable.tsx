"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Location, ServiceCategory } from "@/generated/prisma/client"
import { useDialog } from "@/hooks"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { ConfirmArchiveServiceModal } from "../ConfirmArchiveServiceModal"
import { CreateServiceModal } from "../CreateServiceModal"
import { EditServiceModal } from "../EditServiceModal"
import { columns } from "./columns"

export type ServiceTableProps = {
  services: ServiceWithRelations[]
  offices: Location[]
  categories: ServiceCategory[]
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  insertService: (service: Partial<ServiceWithRelations>) => Promise<ServiceWithRelations | null>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  revalidateTable: () => Promise<void>
}

export const ServiceTable = ({
  services,
  offices,
  categories,
  updateService,
  insertService,
  doesServiceCodeExist,
  revalidateTable,
}: ServiceTableProps) => {
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

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null)

  const handleRowClick = (service: ServiceWithRelations) => {
    setSelectedService(service)
    openEditServiceModal()
  }

  const servicesToShow = showArchived
    ? services
    : services.filter((service) => service.deletedAt === null)
  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        <h3 className="self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
        <button type="button" onClick={openCreateServiceModal} className="primary">
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
        offices={offices}
        categories={categories}
        updateService={updateService}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
        openConfirmArchiveServiceModal={openConfirmArchiveServiceModal}
      />
      <CreateServiceModal
        open={createServiceModalOpen}
        onClose={closeCreateServiceModal}
        offices={offices}
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
