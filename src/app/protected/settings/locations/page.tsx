import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { LocationTable } from "@/components/settings/locations/LocationTable"
import type { Counter } from "@/generated/prisma/client"
import { doesLocationCodeExist } from "@/lib/prisma/location/doesLocationCodeExist"
import { getAllLocations } from "@/lib/prisma/location/getAllLocations"
import { insertLocation } from "@/lib/prisma/location/insertLocation"
import { updateLocation } from "@/lib/prisma/location/updateLocation"
import { getAllServices } from "@/lib/prisma/service/getAllServices"
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
  const locations = await getAllLocations()
  const services = await getAllServices()
  const counters = [] as Counter[]
  const staffUsers = await getAllStaffUsers()

  const revalidateTable = async () => {
    "use server"
    revalidatePath("/protected/settings/locations")
  }

  return (
    <div className="space-y-sm">
      <h2>Locations</h2>
      <LocationTable
        currentUser={currentUser}
        locations={locations}
        services={services}
        counters={counters}
        staffUsers={staffUsers}
        updateLocation={updateLocation}
        insertLocation={insertLocation}
        doesLocationCodeExist={doesLocationCodeExist}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
