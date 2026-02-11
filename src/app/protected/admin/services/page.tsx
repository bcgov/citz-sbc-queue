import { ServiceTable } from "@/components/admin/services/ServiceTable"
import { getAllServices } from "@/lib/prisma/service/getAllServices"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

export default async function Page() {
  const services = await getAllServices()

  return (
    <div className="space-y-sm">
      <h2>Services</h2>
      <ServiceTable services={services} />
    </div>
  )
}
