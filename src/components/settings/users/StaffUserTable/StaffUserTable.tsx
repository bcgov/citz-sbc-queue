"use client"

import { DataTable } from "@/components/common/datatable"
import { Switch } from "@/components/common/switch"
import type { Role } from "@/generated/prisma/client"
import { useStaffUserTable } from "@/hooks/settings/users/useStaffUserTable"
import type { CounterWithRelations } from "@/lib/prisma/counter/types"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { ConfirmArchiveUserModal } from "../ConfirmArchiveUserModal"
import { EditStaffUserModal } from "../EditStaffUserModal"
import { columns } from "./columns"

export type UserTableProps = {
  currentUser: StaffUserWithRelations | null
  users: StaffUserWithRelations[]
  locations: LocationWithRelations[]
  counters: CounterWithRelations[]
  updateStaffUser: (
    user: Partial<StaffUserWithRelations>,
    prevUser: Partial<StaffUserWithRelations>,
    availableRoles?: Role[]
  ) => Promise<StaffUserWithRelations | null>
  revalidateTable: () => Promise<void>
}

export const StaffUserTable = ({
  currentUser,
  users,
  locations,
  counters,
  updateStaffUser,
  revalidateTable,
}: UserTableProps) => {
  const {
    showArchived,
    setShowArchived,
    selectedUser,
    canEditSelectedUser,
    canArchiveSelectedUser,
    canEditLocationSelectedUser,
    availableRolesForSelectedUser,
    usersToShow,
    handleRowClick,
    editUserModalOpen,
    closeEditUserModal,
    confirmArchiveUserModalOpen,
    openConfirmArchiveUserModal,
    closeConfirmArchiveUserModal,
  } = useStaffUserTable({ currentUser, users, locations, revalidateTable })

  return (
    <>
      <div className="flex justify-end mb-3">
        <h3 className="mr-2 self-center text-sm font-medium text-gray-700">Show Archived</h3>
        <Switch checked={showArchived} onChange={setShowArchived} />
      </div>
      <DataTable
        data={usersToShow}
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
        emptyMessage="No users found."
        onRowClick={handleRowClick}
      />
      <EditStaffUserModal
        open={editUserModalOpen}
        onClose={closeEditUserModal}
        user={selectedUser}
        canEdit={canEditSelectedUser}
        canArchive={canArchiveSelectedUser}
        canEditLocation={canEditLocationSelectedUser}
        availableRoles={availableRolesForSelectedUser}
        locations={locations}
        counters={counters}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
        openConfirmArchiveUserModal={openConfirmArchiveUserModal}
      />
      <ConfirmArchiveUserModal
        open={confirmArchiveUserModalOpen}
        onClose={closeConfirmArchiveUserModal}
        user={selectedUser}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    </>
  )
}
