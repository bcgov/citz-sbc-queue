import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useLocations } from "./useLocations"

describe("useLocations", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("returns locations on success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          locations: [
            {
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
          ],
        },
      }),
    } as unknown as Response)

    const { result } = renderHook(() => useLocations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.locations).toHaveLength(1)
    expect(result.current.locations?.[0]?.id).toBe("loc-1")
  })

  it("returns error when API responds unauthorized", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: "Unauthorized - No valid authentication found",
      }),
    } as unknown as Response)

    const { result } = renderHook(() => useLocations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.locations).toBeNull()
    expect(result.current.error).toBe("Unauthorized - No valid authentication found")
  })
})
