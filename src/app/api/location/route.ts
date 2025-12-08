import { NextResponse } from "next/server"
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getLocationByNumber,
  updateLocation,
} from "./helpers"
import type { CreateLocation, Location, UpdateLocation } from "./types"

// GET /api/location - list or get single by `number` query
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const number = url.searchParams.get("number")

    if (number) {
      const loc = getLocationByNumber(number)
      if (!loc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
      return NextResponse.json({ success: true, data: loc }, { status: 200 })
    }

    const all = getAllLocations()
    return NextResponse.json({ success: true, data: all }, { status: 200 })
  } catch (error) {
    console.error("/api/location GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

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

    // If client didn't provide a number, auto-generate next numeric string
    let number = payload.number
    if (!number) {
      const all = getAllLocations()
      const max = all.reduce((acc, cur) => Math.max(acc, Number.parseInt(cur.number, 10) || 0), 0)
      number = String(max + 1).padStart(3, "0")
    }

    const toCreate: Location = {
      name: payload.name,
      number,
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

// PUT /api/location?number=NNN - update an existing location
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const number = url.searchParams.get("number")
    if (!number)
      return NextResponse.json({ success: false, error: "Number is required" }, { status: 400 })

    const updates = (await request.json()) as UpdateLocation

    const updated = updateLocation(number, updates)
    if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error) {
    console.error("/api/location PUT error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/location?number=NNN - delete a location
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const number = url.searchParams.get("number")
    if (!number)
      return NextResponse.json({ success: false, error: "Number is required" }, { status: 400 })

    const ok = deleteLocation(number)
    if (!ok) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("/api/location DELETE error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
