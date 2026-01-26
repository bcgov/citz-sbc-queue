import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { CSR, Location, StaffUser } from "@/generated/prisma/client"
import { getCSRByUsername } from "@/lib/prisma/legacy/csr/getCSRByUsername"
import { getLocationByLegacyOfficeId } from "@/lib/prisma/location/getLocationByLegacyOfficeId"
import { getStaffUserBySub } from "@/lib/prisma/staff_user/getStaffUserBySub"
import { insertStaffUser } from "@/lib/prisma/staff_user/insertStaffUser"
import { updateStaffUser } from "@/lib/prisma/staff_user/updateStaffUser"
import { decodeJWT } from "@/utils/auth/jwt/decodeJWT"
import type { SSOIdirUser } from "@/utils/auth/types"
import { assignNewRoleFromCSR } from "./assignNewRoleFromCSR"
import { updateUserOnLogin } from "./updateUserOnLogin"

vi.mock("@/utils/auth/jwt/decodeJWT", () => ({ decodeJWT: vi.fn() }))
vi.mock("@/lib/prisma/staff_user/getStaffUserBySub", () => ({ getStaffUserBySub: vi.fn() }))
vi.mock("@/lib/prisma/staff_user/updateStaffUser", () => ({ updateStaffUser: vi.fn() }))
vi.mock("@/lib/prisma/legacy/csr/getCSRByUsername", () => ({ getCSRByUsername: vi.fn() }))
vi.mock("./assignNewRoleFromCSR", () => ({ assignNewRoleFromCSR: vi.fn() }))
vi.mock("@/lib/prisma/location/getLocationByLegacyOfficeId", () => ({
  getLocationByLegacyOfficeId: vi.fn(),
}))
vi.mock("@/lib/prisma/staff_user/insertStaffUser", () => ({ insertStaffUser: vi.fn() }))

describe("updateUserOnLogin", () => {
  const mockJwt: SSOIdirUser = {
    exp: 0,
    iat: 0,
    auth_time: 0,
    jti: "",
    iss: "",
    aud: "",
    sub: "test-sub",
    typ: "",
    azp: "",
    nonce: "",
    session_state: "",
    sid: "",
    identity_provider: "idir",
    email_verified: true,
    preferred_username: "test.user",
    client_roles: ["CSR"],
    idir_user_guid: "test-guid",
    idir_username: "test.user",
    name: "Test User",
    display_name: "Test User",
    given_name: "Test",
    family_name: "User",
    email: "test@example.com",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(decodeJWT).mockReturnValue(mockJwt)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("updates existing staff user when found", async () => {
    const existingUser: Partial<StaffUser> = { guid: "existing-guid", sub: "test-sub" }
    vi.mocked(getStaffUserBySub).mockResolvedValueOnce(existingUser as StaffUser)

    await updateUserOnLogin("token")

    expect(getStaffUserBySub).toHaveBeenCalledWith("test-sub")
    expect(updateStaffUser).toHaveBeenCalled()
    expect(getCSRByUsername).not.toHaveBeenCalled()
    expect(insertStaffUser).not.toHaveBeenCalled()
  })

  it("inserts new staff user when no existing user but CSR found", async () => {
    vi.mocked(getStaffUserBySub).mockResolvedValueOnce(null)

    const csr: CSR = {
      csrId: 10,
      csrStateId: 1,
      username: "test.user",
      roleId: 1,
      officeId: 123,
      counterId: 5,
      deleted: null,
      financeDesignate: 1,
      ita2Designate: 0,
      officeManager: 1,
      pesticideDesignate: 0,
      receptionistInd: 1,
    }

    vi.mocked(getCSRByUsername).mockResolvedValueOnce(csr)
    vi.mocked(assignNewRoleFromCSR).mockResolvedValueOnce("SDM")
    vi.mocked(getLocationByLegacyOfficeId).mockResolvedValueOnce({ id: "loc-id-1" } as Location)

    await updateUserOnLogin("token")

    expect(getCSRByUsername).toHaveBeenCalledWith("test.user")
    expect(assignNewRoleFromCSR).toHaveBeenCalledWith("test-sub", 1)
    expect(getLocationByLegacyOfficeId).toHaveBeenCalledWith(123)
    expect(insertStaffUser).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "test-sub",
        guid: "test-guid",
        legacyCsrId: 10,
        username: "test.user",
        displayName: "Test User",
        role: "SDM",
        isActive: true,
        location: { connect: { id: "loc-id-1" } },
        counterId: 5,
        deletedAt: null,
        isFinanceDesignate: true,
        isIta2Designate: false,
        isOfficeManager: true,
        isPesticideDesignate: false,
        isReceptionist: true,
      })
    )
  })

  it("inserts new staff user with defaults when no CSR found", async () => {
    vi.mocked(getStaffUserBySub).mockResolvedValueOnce(null)
    vi.mocked(getCSRByUsername).mockResolvedValueOnce(null)
    vi.mocked(assignNewRoleFromCSR).mockResolvedValueOnce("CSR")

    await updateUserOnLogin("token")

    expect(getCSRByUsername).toHaveBeenCalledWith("test.user")
    expect(assignNewRoleFromCSR).toHaveBeenCalledWith("test-sub", null)
    expect(getLocationByLegacyOfficeId).not.toHaveBeenCalled()
    expect(insertStaffUser).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "test-sub",
        guid: "test-guid",
        legacyCsrId: null,
        username: "test.user",
        displayName: "Test User",
        role: "CSR",
        isActive: true,
        location: undefined,
        counterId: null,
        deletedAt: null,
        isFinanceDesignate: false,
        isIta2Designate: false,
        isOfficeManager: false,
        isPesticideDesignate: false,
        isReceptionist: false,
      })
    )
  })
})
