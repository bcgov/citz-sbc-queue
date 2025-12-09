import { NextResponse } from "next/server"
import { createLocation, getAllLocations } from "./helpers"
import type { CreateLocation, Location } from "./types"

// POST /api/location - create a new location
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = body as CreateLocation

    if (!payload.name || !payload.timezone || !payload.streetAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // If client didn't provide a id, auto-generate next numeric string
    let id = payload.id
    if (!id) {
      const all = getAllLocations()
      const max = all.reduce((acc, cur) => Math.max(acc, Number.parseInt(cur.id, 10) || 0), 0)
      id = String(max + 1).padStart(3, "0")
    }

    const toCreate: Location = {
      name: payload.name,
      id,
      timezone: payload.timezone,
      streetAddress: payload.streetAddress,
      mailAddress: payload.mailAddress ?? "",
      phoneNumber: payload.phoneNumber ?? "",
      latitude: payload.latitude ?? 0,
      longitude: payload.longitude ?? 0,
    }
    const created = createLocation(toCreate)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error("/api/location POST error:", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    )
  }
}
