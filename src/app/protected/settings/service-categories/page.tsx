import { revalidatePath } from "next/cache"
import { ServiceCategoryTable } from "@/components/settings/service_categories/ServiceCategoryTable"
import { getAllServices } from "@/lib/prisma/service/getAllServices"
import { getAllServiceCategories } from "@/lib/prisma/service_category/getAllServiceCategories"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const serviceCategories = await getAllServiceCategories()
  const services = await getAllServices()

  const revalidateTable = async () => {
    "use server"
    revalidatePath("/protected/settings/service-categories")
  }

  return (
    <div className="space-y-sm">
      <h2>Service Categories</h2>
      <ServiceCategoryTable
        serviceCategories={serviceCategories}
        services={services}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
