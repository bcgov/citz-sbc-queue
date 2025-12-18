import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { LocationProvider, useLocationContext } from "./LocationProvider"

beforeEach(() => {
  ;(global as any).fetch = undefined
})

afterEach(() => {
  ;(global as any).fetch = undefined
  vi.resetAllMocks()
})

describe("LocationProvider initialization", () => {
  it("sets current location to first server location when none was set", async () => {
    const first = { id: "L1", name: "First" }
    const second = { id: "L2", name: "Second" }

    const responses = [{ ok: true, json: async () => ({ success: true, data: [first, second] }) }]
    ;(global as any).fetch = vi.fn(() => Promise.resolve(responses.shift()))

    const { result } = renderHook(() => useLocationContext(), {
      wrapper: ({ children }) => <LocationProvider>{children}</LocationProvider>,
    })

    // explicitly refresh so we don't rely on the timing of the init effect
    await act(async () => {
      await result.current.refreshLocations()
    })

    expect(result.current.location).toEqual(first)
  })

  it("leaves current location null when server returns no locations", async () => {
    const responses = [{ ok: true, json: async () => ({ success: true, data: [] }) }]
    ;(global as any).fetch = vi.fn(() => Promise.resolve(responses.shift()))

    const { result } = renderHook(() => useLocationContext(), {
      wrapper: ({ children }) => <LocationProvider>{children}</LocationProvider>,
    })

    // wait for the provider's init effect to complete
    await waitFor(() => result.current.locations !== null)

    expect(result.current.location).toBeNull()
  })
})
