import { NextResponse } from "next/server"
import { updateLocation } from "./helpers"
import type { UpdateLocation } from "./types"

// PUT /api/location?id=NNN - update an existing location
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })

    const updates = (await request.json()) as UpdateLocation

    const updated = await updateLocation(id, updates)
    if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error) {
    console.error("/api/location PUT error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
