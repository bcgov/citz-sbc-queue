import { revalidatePath } from "next/cache"
import { ServiceTable } from "@/components/settings/services/ServiceTable"
import { getAllLocations } from "@/lib/prisma/location/getAllLocations"
import { doesServiceCodeExist } from "@/lib/prisma/service/doesServiceCodeExist"
import { getAllServices } from "@/lib/prisma/service/getAllServices"
import { insertService } from "@/lib/prisma/service/insertService"
import { updateService } from "@/lib/prisma/service/updateService"
import { getAllServiceCategories } from "@/lib/prisma/service_category/getAllServiceCategories"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const services = await getAllServices()
  const categories = await getAllServiceCategories()
  const locations = await getAllLocations()

  const revalidateTable = async () => {
    "use server"
    revalidatePath("/protected/settings/services")
  }

  return (
    <div className="space-y-sm">
      <h2>Services</h2>
      <ServiceTable
        services={services}
        updateService={updateService}
        insertService={insertService}
        locations={locations}
        categories={categories}
        doesServiceCodeExist={doesServiceCodeExist}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
