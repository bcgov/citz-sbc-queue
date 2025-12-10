import { NextResponse } from "next/server"
import { deleteLocation } from "@/utils/location"

// DELETE /api/location?id=UUID - soft delete a location
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 })

    const ok = await deleteLocation(id)
    if (!ok) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("/api/location DELETE error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
