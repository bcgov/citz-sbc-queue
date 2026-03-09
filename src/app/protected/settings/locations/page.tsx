import { revalidatePath } from "next/cache"
import { LocationTable } from "@/components/settings/locations/LocationTable"
import { getAllLocations } from "@/lib/prisma/location/getAllLocations"
import { getAllServices } from "@/lib/prisma/service/getAllServices"
import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const locations = await getAllLocations()
  const services = await getAllServices()
  const staffUsers = await getAllStaffUsers()

  const revalidateTable = async () => {
    "use server"
    revalidatePath("/protected/settings/locations")
  }

  return (
    <div className="space-y-sm">
      <h2>Locations</h2>
      <LocationTable
        locations={locations}
        services={services}
        staffUsers={staffUsers}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
