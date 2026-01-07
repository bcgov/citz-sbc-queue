import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCurrentLocation } from "./CurrentLocationContext"
import CurrentLocationProvider from "./CurrentLocationProvider"

describe("CurrentLocationProvider", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("sets location to null with no error when unauthorized", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: "Unauthorized - No valid authentication found",
      }),
    } as unknown as Response)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CurrentLocationProvider>{children}</CurrentLocationProvider>
    )

    const { result } = renderHook(() => useCurrentLocation(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.location).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("provides current location when API returns one", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          location: {
            id: "loc-1",
            name: "Victoria",
            timezone: "America/Vancouver",
            streetAddress: "123 Main St",
            mailAddress: null,
            phoneNumber: null,
            latitude: 48.4284,
            longitude: -123.3656,
            legacyOfficeNumber: null,
          },
        },
      }),
    } as unknown as Response)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CurrentLocationProvider>{children}</CurrentLocationProvider>
    )

    const { result } = renderHook(() => useCurrentLocation(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.location?.id).toBe("loc-1")
  })

  it("updates current location via PATCH", async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            location: null,
          },
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            locationId: "loc-2",
          },
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            location: {
              id: "loc-2",
              name: "Kelowna",
              timezone: "America/Vancouver",
              streetAddress: "456 Side St",
              mailAddress: null,
              phoneNumber: null,
              latitude: 49.888,
              longitude: -119.496,
              legacyOfficeNumber: null,
            },
          },
        }),
      } as unknown as Response)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CurrentLocationProvider>{children}</CurrentLocationProvider>
    )

    const { result } = renderHook(() => useCurrentLocation(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const ok = await act(async () => await result.current.setCurrentLocation("loc-2"))
    expect(ok).toBe(true)

    await waitFor(() => {
      expect(result.current.location?.id).toBe("loc-2")
    })

    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
      "/api/protected/current-location",
      expect.objectContaining({ method: "PATCH" })
    )
  })
})
