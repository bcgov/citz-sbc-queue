import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock the helpers module that's used by the route handlers
vi.mock("./helpers", () => {
  return {
    getAllLocations: vi.fn(),
    getLocationByNumber: vi.fn(),
    createLocation: vi.fn(),
    updateLocation: vi.fn(),
    deleteLocation: vi.fn(),
  }
})

import * as helpers from "./helpers"
import { DELETE, GET, POST, PUT } from "./route"

describe("/api/location route handlers", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("GET without number returns all locations", async () => {
    const sample = [{ number: "001", name: "A" }]
    ;(helpers.getAllLocations as any).mockReturnValue(sample)

    const res = await GET({ url: "http://localhost/api/location" } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true, data: sample })
  })

  it("GET with number not found returns 404", async () => {
    ;(helpers.getLocationByNumber as any).mockReturnValue(undefined)

    const res = await GET({ url: "http://localhost/api/location?number=999" } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body).toEqual({ success: false, error: "Not found" })
  })

  it("POST missing required fields returns 400", async () => {
    const req = { url: "http://localhost/api/location", json: async () => ({}) }
    const res = await POST(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ success: false, error: "Missing required fields" })
  })

  it("POST with provided number creates and returns 201", async () => {
    const payload = { name: "X", timezone: "TZ", streetAddress: "S", number: "010" }
    ;(helpers.createLocation as any).mockImplementation((x: any) => x)

    const req = { url: "http://localhost/api/location", json: async () => payload }
    const res = await POST(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.number).toBe("010")
  })

  it("PUT without number returns 400", async () => {
    const req = { url: "http://localhost/api/location", json: async () => ({ name: "Y" }) }
    const res = await PUT(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ success: false, error: "Number is required" })
  })

  it("PUT not found returns 404", async () => {
    ;(helpers.updateLocation as any).mockReturnValue(null)
    const req = {
      url: "http://localhost/api/location?number=999",
      json: async () => ({ name: "Z" }),
    }
    const res = await PUT(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body).toEqual({ success: false, error: "Not found" })
  })

  it("DELETE success returns 200", async () => {
    ;(helpers.deleteLocation as any).mockReturnValue(true)
    const res = await DELETE({
      url: "http://localhost/api/location?number=001",
    } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true })
  })
})
