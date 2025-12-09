import { revalidatePath } from "next/cache"
import { UserTable } from "@/components/admin/users/UserTable"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"
import { updateStaffUserOnLogin } from "@/lib/prisma/staff_user/updateStaffUserOnLogin"

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
        <UserTable
          users={users}
          updateStaffUserOnLogin={updateStaffUserOnLogin}
          revalidateTable={revalidateTable}
        />
      </div>
    </div>
  )
}
