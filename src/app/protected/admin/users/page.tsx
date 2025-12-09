import { UserTable } from "@/components/admin/users/UserTable"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"

export default async function Page() {
  const users = await getAllStaffUsers()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <UserTable users={users} />
      </div>
    </div>
  )
}
