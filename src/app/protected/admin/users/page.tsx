import { revalidatePath } from "next/cache"
import { StaffUserTable } from "@/components/admin/users/StaffUserTable"
import { getAllLocations } from "@/lib/prisma/location"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const users = await getAllStaffUsers()
  const offices = await getAllLocations()

  const revalidateTable = async () => {
    "use server"
    revalidatePath("/protected/admin/users")
  }

  return (
    <div className="space-y-sm">
      <h2>Users</h2>
      <StaffUserTable
        users={users}
        offices={offices}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
