"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Location } from "@/generated/prisma/client"
import { useDialog } from "@/hooks"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { EditServiceModal } from "../EditServiceModal"
import { columns } from "./columns"

export type ServiceTableProps = {
  services: ServiceWithRelations[]
  offices: Location[]
  updateService: (
    service: Partial<ServiceWithRelations>,
    prevService: Partial<ServiceWithRelations>
  ) => Promise<ServiceWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const ServiceTable = ({
  services,
  offices,
  updateService,
  revalidateTable,
}: ServiceTableProps) => {
  const {
    open: editServiceModalOpen,
    openDialog: openEditServiceModal,
    closeDialog: closeEditServiceModal,
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
      <div className="flex justify-end mb-3">
        <h3 className="mr-2 self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
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
        updateService={updateService}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
