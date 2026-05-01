"use client"

import { DataTable } from "@/components/common/datatable"
import { useCounterTable } from "@/hooks/settings/counters/useCounterTable"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { columns } from "./columns"

export type CounterTableProps = {
  currentUser: StaffUserWithRelations | null
  counters: CounterWithRelations[]
  updateCounter: (
    counter: Partial<CounterWithRelations>,
    prevCounter: Partial<CounterWithRelations>
  ) => Promise<CounterWithRelations | null>
  insertCounter: (counter: Partial<CounterWithRelations>) => Promise<CounterWithRelations | null>
  deleteCounter: (counterId: string) => Promise<void>
  revalidateTable: () => Promise<void>
}

export const CounterTable = ({ currentUser, counters, revalidateTable }: CounterTableProps) => {
  const { canCreate, countersToShow, handleRowClick, openCreateCounterModal } = useCounterTable({
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
    </>
  )
}
