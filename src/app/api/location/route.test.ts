import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock the location utils module that's used by the route handlers
vi.mock("@/utils/location", () => {
  return {
    getAllLocations: vi.fn(),
    getLocationById: vi.fn(),
    createLocation: vi.fn(),
    updateLocation: vi.fn(),
    deleteLocation: vi.fn(),
  }
})

import * as helpers from "@/utils/location"
import { DELETE, GET, POST, PUT } from "./route"

describe("/api/location route handlers", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("GET without id returns all locations", async () => {
    const sample = [{ id: "001", name: "A" }]
    ;(helpers.getAllLocations as any).mockReturnValue(sample)

    const res = await GET({ url: "http://localhost/api/location" } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true, data: sample })
  })

  it("GET with id not found returns 404", async () => {
    ;(helpers.getLocationById as any).mockReturnValue(undefined)

    const res = await GET({ url: "http://localhost/api/location?id=999" } as unknown as Request)
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

  it("POST with provided id creates and returns 201", async () => {
    const payload = { name: "X", timezone: "TZ", streetAddress: "S", id: "010" }
    ;(helpers.createLocation as any).mockImplementation((x: any) => x)

    const req = { url: "http://localhost/api/location", json: async () => payload }
    const res = await POST(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe("010")
  })

  it("PUT without id returns 400", async () => {
    const req = { url: "http://localhost/api/location", json: async () => ({ name: "Y" }) }
    const res = await PUT(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ success: false, error: "id is required" })
  })

  it("PUT not found returns 404", async () => {
    ;(helpers.updateLocation as any).mockReturnValue(null)
    const req = {
      url: "http://localhost/api/location?id=999",
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
      url: "http://localhost/api/location?id=001",
    } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true })
  })

  it("GET with id found returns 200", async () => {
    const found = { id: "002", name: "B" }
    ;(helpers.getLocationById as any).mockReturnValue(found)

    const res = await GET({ url: "http://localhost/api/location?id=002" } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true, data: found })
  })

  it("POST without id auto-generates and returns 201", async () => {
    // getAllLocations returns numbers 001 and 002 -> next should be 003
    ;(helpers.getAllLocations as any).mockReturnValue([{ id: "001" }, { id: "002" }])
    ;(helpers.createLocation as any).mockImplementation((x: any) => x)

    const payload = { name: "Auto", timezone: "TZ", streetAddress: "Addr" }
    const req = { url: "http://localhost/api/location", json: async () => payload }
    const res = await POST(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe("003")
  })

  it("POST createLocation throws returns 500", async () => {
    ;(helpers.createLocation as any).mockImplementation(() => {
      throw new Error("boom")
    })
    const payload = { name: "X", timezone: "TZ", streetAddress: "S", id: "011" }
    const req = { url: "http://localhost/api/location", json: async () => payload }
    const res = await POST(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/boom|Internal server error/)
  })

  it("PUT success returns 200 with updated data", async () => {
    const updated = { id: "010", name: "Updated" }
    ;(helpers.updateLocation as any).mockReturnValue(updated)
    const req = {
      url: "http://localhost/api/location?id=010",
      json: async () => ({ name: "Updated" }),
    }
    const res = await PUT(req as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true, data: updated })
  })

  it("DELETE without id returns 400", async () => {
    const res = await DELETE({ url: "http://localhost/api/location" } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ success: false, error: "ID is required" })
  })

  it("DELETE not found returns 404", async () => {
    ;(helpers.deleteLocation as any).mockReturnValue(false)
    const res = await DELETE({
      url: "http://localhost/api/location?id=999",
    } as unknown as Request)
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body).toEqual({ success: false, error: "Not found" })
  })
})
