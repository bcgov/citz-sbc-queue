import { NextResponse } from "next/server"
import { getAllLocations, getLocationByNumber } from "./helpers"

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
