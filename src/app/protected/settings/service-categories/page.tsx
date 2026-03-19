import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { ServiceCategoryTable } from "@/components/settings/service_categories/ServiceCategoryTable"
import { getAllServices } from "@/lib/prisma/service/getAllServices"
import { getAllServiceCategories } from "@/lib/prisma/service_category/getAllServiceCategories"
import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { getAuthContext } from "@/utils/auth/getAuthContext"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const headersList = await headers()
  const authContext = getAuthContext(headersList)
  const user = authContext?.user

  const currentUser = await getStaffUserBySub(user?.sub ?? "")
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
        currentUser={currentUser}
        serviceCategories={serviceCategories}
        services={services}
        revalidateTable={revalidateTable}
      />
    </div>
  )
}
