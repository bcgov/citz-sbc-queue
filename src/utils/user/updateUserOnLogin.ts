"use server"

import { getStaffUsers } from "@/lib/prisma/users/getStaffUsers"
import { getStagingStaffUsers } from "@/lib/prisma/users/getStagingStaffUsers"
import { insertStaffUser } from "@/lib/prisma/users/insertStaffUser"
import { updateStaffUser } from "@/lib/prisma/users/updateStaffUser"
import { decodeJWT } from "@/utils/auth/jwt/decodeJWT"
import type { IdirIdentityProvider } from "@/utils/auth/types"

export const updateUserOnLogin = async (accessToken: string) => {
  const jwt = decodeJWT<IdirIdentityProvider>(accessToken)
  const { sub, idir_user_guid, idir_username, display_name } = jwt

  // Check if user exists in the database
  const staffUsersWithMatchingSub = await getStaffUsers({ sub })
  const staffUser = staffUsersWithMatchingSub.length > 0 ? staffUsersWithMatchingSub[0] : null

  if (staffUser) {
    // Update user
    await updateStaffUser({ sub }, { username: idir_username, displayName: display_name })
  } else {
    // Check for legacy user in staging table
    const stagingUsers = await getStagingStaffUsers({ username: idir_username })
    const stagingUser = stagingUsers.length > 0 ? stagingUsers[0] : null

    // Create new user
    await insertStaffUser({
      sub,
      guid: idir_user_guid,
      csrId: stagingUser ? stagingUser.id : null,
      username: idir_username,
      displayName: display_name,
      role: "CSR",
      isActive: true,
      officeId: stagingUser ? stagingUser.officeId : null,
      counterId: stagingUser ? stagingUser.counterId : null,
      deletedAt: stagingUser ? stagingUser.deletedAt : null,
      isFinanceDesignate: stagingUser ? stagingUser.isFinanceDesignate : false,
      isIta2Designate: stagingUser ? stagingUser.isIta2Designate : false,
      isOfficeManager: stagingUser ? stagingUser.isOfficeManager : false,
      isPesticideDesignate: stagingUser ? stagingUser.isPesticideDesignate : false,
      isReceptionist: stagingUser ? stagingUser.isReceptionist : false,
    })
  }
}
