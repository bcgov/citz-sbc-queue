import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { RoleSwitcher } from "@/components/settings/developer/RoleSwitcher"
import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"
import { getAuthContext } from "@/utils/auth/getAuthContext"

// This page should always be rendered dynamically to ensure fresh data
export const dynamic = "force-dynamic"

const revalidateDeveloperPage = async () => {
  "use server"
  revalidatePath("/protected/settings/developer")
}

export default async function Page() {
  const headersList = await headers()
  const authContext = getAuthContext(headersList)
  const user = authContext?.user

  const currentUser = await getStaffUserBySub(user?.sub ?? "")

  if (!currentUser?.isDeveloper) {
    return (
      <div className="space-y-sm">
        <h2>You do not have access to this page.</h2>
      </div>
    )
  }

  return (
    <div className="space-y-sm">
      <h2>Developer Settings</h2>
      <div className="p-2">
        <RoleSwitcher
          currentUser={currentUser}
          updateStaffUser={updateStaffUser}
          revalidatePage={revalidateDeveloperPage}
        />
      </div>
    </div>
  )
}
