import { revalidatePath } from "next/cache"
import { StaffUserTable } from "@/components/admin/users/StaffUserTable"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const users = await getAllStaffUsers()

  const revalidateTable = async () => {
    "use server"
    revalidatePath("/protected/admin/users")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <StaffUserTable
          users={users}
          updateStaffUser={updateStaffUser}
          revalidateTable={revalidateTable}
        />
      </div>
    </div>
  )
}
