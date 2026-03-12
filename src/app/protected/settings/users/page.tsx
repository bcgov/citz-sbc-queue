import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { StaffUserTable } from "@/components/settings/users/StaffUserTable"
import { getAllLocations } from "@/lib/prisma/location/getAllLocations"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"
import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"
import { getAuthContext } from "@/utils/auth/getAuthContext"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

const revalidateTable = async () => {
  "use server"
  revalidatePath("/protected/settings/users")
}

export default async function Page() {
  const headersList = await headers()
  const authContext = getAuthContext(headersList)
  const user = authContext?.user

  const currentUser = await getStaffUserBySub(user?.sub ?? "")
  const users = await getAllStaffUsers()
  const locations = await getAllLocations()

  return (
    <div className="space-y-sm">
      <h2>Users</h2>
      <StaffUserTable
        currentUser={currentUser}
        users={users}
        locations={locations}
        updateStaffUser={updateStaffUser}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
