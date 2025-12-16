import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Location } from "@/app/api/location/types"

// Provide a deterministic DEFAULT_TEST_OFFICE for tests
const TEST_OFFICE: Location = {
  id: "test-location",
  name: "Test Office",
  legacyOfficeNumber: 999,
  timezone: "America/Vancouver",
  streetAddress: "1 Test Lane, Testville, BC T0T 0T0",
  mailAddress: "",
  phoneNumber: "250-555-0999",
  latitude: 49.0,
  longitude: -123.0,
}

// Mock the location provider module to return a predictable context
vi.mock("./LocationProvider", async () => {
  const actual = await vi.importActual<typeof import("./LocationProvider")>("./LocationProvider")
  return {
    ...actual,
    useLocationContext: () => ({
      location: TEST_OFFICE,
      setLocation: vi.fn(),
      loadLocationByNumber: vi.fn(),
      locations: [],
      refreshLocations: vi.fn().mockResolvedValue(undefined),
    }),
  }
})

import { useAuthStore } from "@/stores/auth/store"
import { useLocation } from "./useLocation"

// Helper to create a simple JWT with base64url encoding using Node Buffer
const createJWT = (payload: Record<string, unknown>) => {
  const header = { alg: "none", typ: "JWT" }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = "fake-signature"
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

describe("useLocation authorization", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    ;(global as any).fetch = undefined
  })

  afterEach(() => {
    ;(global as any).fetch = undefined
  })

  it("Administrator can perform create, update and delete", async () => {
    // Set admin role in the auth store
    const jwt = createJWT({ client_roles: ["Administrator"] })
    act(() => {
      useAuthStore.setState({
        session: {
          accessToken: jwt,
          accessExpiresAt: Date.now() + 10000,
          refreshExpiresAt: Date.now() + 20000,
          sessionEndsAt: Date.now() + 3600000,
        },
      })
    })

    // stub fetch to return successful responses
    const responses = [
      { ok: true, json: async () => ({ data: { id: "1" } }) },
      { ok: true, json: async () => ({ data: { id: "1" } }) },
      { ok: true, json: async () => ({ success: true }) },
    ]
    ;(global as any).fetch = () => Promise.resolve(responses.shift())

    const { result } = renderHook(() => useLocation())

    await act(async () => {
      const created = await result.current.createLocation({
        name: "X",
        timezone: "TZ",
        streetAddress: "S",
      })
      expect(created.id).toBe("1")

      const updated = await result.current.updateLocation("1", { name: "Updated" })
      expect(updated.id).toBe("1")

      const deleted = await result.current.deleteLocation("1")
      expect(deleted).toBe(true)
    })
  })

  it("SDM can update but cannot create or delete", async () => {
    // Set SDM role in the auth store
    const jwt = createJWT({ client_roles: ["SDM"] })
    act(() => {
      useAuthStore.setState({
        session: {
          accessToken: jwt,
          accessExpiresAt: Date.now() + 10000,
          refreshExpiresAt: Date.now() + 20000,
          sessionEndsAt: Date.now() + 3600000,
        },
      })
    })

    const fetchMock = vi.fn()
    ;(global as any).fetch = fetchMock
    // update success
    ;(fetchMock as any).mockImplementationOnce(() =>
      Promise.resolve({ ok: true, json: async () => ({ data: { id: "2" } }) })
    )

    const { result } = renderHook(() => useLocation())

    await act(async () => {
      // update should work
      const updated = await result.current.updateLocation("2", { name: "Updated" })
      expect(updated.id).toBe("2")

      // create should throw
      await expect(async () => {
        await result.current.createLocation({ name: "X", timezone: "TZ", streetAddress: "S" })
      }).rejects.toThrow(/Unauthorized/)

      // delete should throw
      await expect(async () => {
        await result.current.deleteLocation("2")
      }).rejects.toThrow(/Unauthorized/)
    })
  })

  it("non-privileged user cannot create, update, or delete", async () => {
    // No roles set in auth store
    act(() => {
      useAuthStore.setState({ session: null })
    })

    const { result } = renderHook(() => useLocation())

    await act(async () => {
      await expect(async () => {
        await result.current.createLocation({ name: "X", timezone: "TZ", streetAddress: "S" })
      }).rejects.toThrow(/Unauthorized/)

      await expect(async () => {
        await result.current.updateLocation("1", { name: "U" })
      }).rejects.toThrow(/Unauthorized/)

      await expect(async () => {
        await result.current.deleteLocation("1")
      }).rejects.toThrow(/Unauthorized/)
    })
  })
})
