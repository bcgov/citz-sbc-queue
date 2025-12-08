import { NextResponse } from "next/server"
import { deleteLocation } from "./helpers"

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
