import { revalidatePath } from "next/cache"
import { UserTable } from "@/components/admin/users/UserTable"
import type { StaffUser } from "@/generated/prisma/client"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"
import { updateStaffUser } from "@/lib/prisma/users/updateStaffUser"
import { assignRole } from "@/utils/sso/assignRole"
import { unassignRole } from "@/utils/sso/unassignRole"

export default async function Page() {
  const users = await getAllStaffUsers()

  const updateUser = async (user: Partial<StaffUser>, prevUser: Partial<StaffUser>) => {
    "use server"

    const { guid, sub, ...data } = user
    if (!guid || !sub) return

    // SSO Role Update
    if (user.role !== prevUser.role && user.role && prevUser.role) {
      // Remove previous role
      await unassignRole(sub, prevUser.role)
      // Assign new role
      await assignRole(sub, user.role)
    }

    await updateStaffUser({ guid }, data)

    revalidatePath("/protected/admin/users")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <UserTable users={users} updateUser={updateUser} />
      </div>
    </div>
  )
}
