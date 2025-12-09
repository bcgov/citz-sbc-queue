"use server"

import type { Role } from "@/generated/prisma/enums"
import { getCSRByUsername } from "@/lib/prisma/legacy/csr/getCSRByUsername"
import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { insertStaffUser } from "@/lib/prisma/staff_user/insertStaffUser"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"
import { decodeJWT } from "@/utils/auth/jwt/decodeJWT"
import type { IdirIdentityProvider } from "@/utils/auth/types"

export const updateUserOnLogin = async (accessToken: string) => {
  const jwt = decodeJWT<IdirIdentityProvider>(accessToken)
  const { sub, idir_user_guid, idir_username, display_name, client_roles } = jwt
  const userRole = (client_roles?.length ? client_roles[0] : "CSR") as Role

  // Check if user exists in the database
  const staffUser = await getStaffUserBySub(sub)

  if (staffUser) {
    // Update user
    await updateStaffUser(
      {
        sub,
        guid: idir_user_guid,
        username: idir_username,
        displayName: display_name,
        role: userRole,
      },
      staffUser,
      [userRole]
    )
  } else {
    // Check for legacy user in csr table
    const csrUser = await getCSRByUsername(idir_username)

    // Create new user
    await insertStaffUser({
      sub,
      guid: idir_user_guid,
      csrId: csrUser ? csrUser.id : null,
      username: idir_username,
      displayName: display_name,
      role: userRole,
      isActive: true,
      officeId: csrUser ? csrUser.officeId : null,
      counterId: csrUser ? csrUser.counterId : null,
      deletedAt: csrUser ? csrUser.deletedAt : null,
      isFinanceDesignate: csrUser ? csrUser.isFinanceDesignate : false,
      isIta2Designate: csrUser ? csrUser.isIta2Designate : false,
      isOfficeManager: csrUser ? csrUser.isOfficeManager : false,
      isPesticideDesignate: csrUser ? csrUser.isPesticideDesignate : false,
      isReceptionist: csrUser ? csrUser.isReceptionist : false,
    })
  }
}
