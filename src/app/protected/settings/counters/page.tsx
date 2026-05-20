import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { CounterTable } from "@/components/settings/counters/CounterTable"
import { getAllCounters } from "@/lib/prisma/counter/getAllCounters"
import { insertCounter } from "@/lib/prisma/counter/insertCounter"
import { updateCounter } from "@/lib/prisma/counter/updateCounter"
import { getAllLocations } from "@/lib/prisma/location/getAllLocations"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"
import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { getAuthContext } from "@/utils/auth/getAuthContext"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const headersList = await headers()
  const authContext = getAuthContext(headersList)
  const user = authContext?.user

  const currentUser = await getStaffUserBySub(user?.sub ?? "")
  const counters = await getAllCounters()
  const locations = await getAllLocations()
  const staffUsers = await getAllStaffUsers()

  const revalidateTable = async () => {
    "use server"
    revalidatePath("/protected/settings/counters")
  }

  return (
    <div className="space-y-sm">
      <h2>Counters</h2>
      <CounterTable
        currentUser={currentUser}
        counters={counters}
        locations={locations}
        staffUsers={staffUsers}
        updateCounter={updateCounter}
        insertCounter={insertCounter}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
