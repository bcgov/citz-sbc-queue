"use server"

import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"

export const updateUserOnLogout = async (sub: string) => {
  // Check if user exists in the database
  const staffUser = await getStaffUserBySub(sub)

  if (staffUser) {
    // Update user
    await updateStaffUser(
      {
        isActive: false,
      },
      staffUser
    )
  } else {
    console.log(`No staff user found for sub: ${sub} on logout.`)
  }
}
