import { NextResponse } from "next/server"
import { getAllLocations, getLocationById } from "@/utils/location"

// GET /api/location - list or get single by `id` query
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (id) {
      const loc = await getLocationById(id)
      if (!loc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
      return NextResponse.json({ success: true, data: loc }, { status: 200 })
    }

    const all = await getAllLocations()
    return NextResponse.json({ success: true, data: all }, { status: 200 })
  } catch (error) {
    console.error("/api/location GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
