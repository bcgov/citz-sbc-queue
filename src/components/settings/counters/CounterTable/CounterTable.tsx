"use client"

import { DataTable } from "@/components/common/datatable"
import { useCounterTable } from "@/hooks/settings/counters/useCounterTable"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { CreateCounterModal } from "../CreateCounterModal"
import { EditCounterModal } from "../EditCounterModal"
import { columns } from "./columns"

export type CounterTableProps = {
  currentUser: StaffUserWithRelations | null
  counters: CounterWithRelations[]
  locations: LocationWithRelations[]
  staffUsers: StaffUserWithRelations[]
  updateCounter: (
    counter: Partial<CounterWithRelations>,
    prevCounter: Partial<CounterWithRelations>
  ) => Promise<CounterWithRelations | null>
  insertCounter: (counter: Partial<CounterWithRelations>) => Promise<CounterWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const CounterTable = ({
  currentUser,
  counters,
  locations,
  staffUsers,
  updateCounter,
  insertCounter,
  revalidateTable,
}: CounterTableProps) => {
  const {
    selectedCounter,
    canCreate,
    canEditSelectedCounter,
    countersToShow,
    handleRowClick,
    editCounterModalOpen,
    closeEditCounterModal,
    createCounterModalOpen,
    openCreateCounterModal,
    closeCreateCounterModal,
  } = useCounterTable({
    currentUser,
    counters,
    revalidateTable,
  })

  return (
    <>
      <div className="flex items-center justify-end mb-3 gap-4">
        {canCreate && (
          <button type="button" onClick={openCreateCounterModal} className="primary">
            + Create
          </button>
        )}
      </div>
      <DataTable
        data={countersToShow}
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
        emptyMessage="No counters found."
        onRowClick={handleRowClick}
      />
      <EditCounterModal
        open={editCounterModalOpen}
        onClose={closeEditCounterModal}
        counter={selectedCounter}
        locations={locations}
        staffUsers={staffUsers}
        canEdit={canEditSelectedCounter}
        updateCounter={updateCounter}
        revalidateTable={revalidateTable}
      />
      <CreateCounterModal
        open={createCounterModalOpen}
        onClose={closeCreateCounterModal}
        locations={locations}
        staffUsers={staffUsers}
        insertCounter={insertCounter}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
