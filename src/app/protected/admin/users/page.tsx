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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
      <StaffUserTable
        users={users}
        offices={offices}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
