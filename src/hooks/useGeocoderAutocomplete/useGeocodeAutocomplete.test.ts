import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useGeocodeAutocomplete } from "./useGeocodeAutocomplete"

describe("useGeocodeAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useGeocodeAutocomplete())

    expect(result.current.suggestions).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("does not search with less than minimum characters", async () => {
    const { result } = renderHook(() => useGeocodeAutocomplete({ minChars: 3 }))

    await result.current.search("ab")

    expect(result.current.suggestions).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("fetches suggestions successfully", async () => {
    const mockSuggestions = [
      {
        id: "site-1",
        label: "525 Superior Street, Victoria, BC",
        address: "525 Superior Street, Victoria, BC",
        coordinates: { latitude: 48.4261, longitude: -123.3656 },
      },
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    })

    const { result } = renderHook(() => useGeocodeAutocomplete())

    await result.current.search("525 Superior")

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/protected/geocoder?address=${encodeURIComponent("525 Superior")}`
    )
  })

  it("handles API errors", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Server error" }),
    })

    const { result } = renderHook(() => useGeocodeAutocomplete())

    await result.current.search("victoria")

    await waitFor(() => {
      expect(result.current.error).toBe("Server error")
      expect(result.current.suggestions).toEqual([])
    })
  })

  it("handles network errors", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useGeocodeAutocomplete())

    await result.current.search("victoria")

    await waitFor(() => {
      expect(result.current.error).toBe("Network error")
      expect(result.current.suggestions).toEqual([])
    })
  })

  it("clears suggestions and error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suggestions: [{ id: "1", label: "Test", address: "Test St" }],
      }),
    })

    const { result } = renderHook(() => useGeocodeAutocomplete())

    await result.current.search("test")

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(1)
    })

    result.current.clear()

    expect(result.current.suggestions).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it("respects custom minChars option", async () => {
    const { result } = renderHook(() => useGeocodeAutocomplete({ minChars: 5 }))

    await result.current.search("test")

    expect(result.current.suggestions).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()

    await result.current.search("victoria")

    expect(global.fetch).toHaveBeenCalled()
  })

  it("clears suggestions when search string is empty", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    })

    const { result } = renderHook(() => useGeocodeAutocomplete())

    await result.current.search("victoria")
    await result.current.search("")

    expect(result.current.suggestions).toEqual([])
  })
})
