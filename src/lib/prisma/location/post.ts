import { NextResponse } from "next/server"
import type { Prisma } from "@/generated/prisma/client"
import { createLocation } from "@/utils"

// POST /api/location - create a new location
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = body as Partial<Prisma.LocationCreateInput>

    if (!payload.name || !payload.timezone || !payload.streetAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const toCreate: Prisma.LocationCreateInput = {
      name: payload.name,
      timezone: payload.timezone,
      streetAddress: payload.streetAddress,
      mailAddress: payload.mailAddress ?? null,
      phoneNumber: payload.phoneNumber ?? null,
      latitude: payload.latitude ?? 0,
      longitude: payload.longitude ?? 0,
      legacyOfficeNumber: payload.legacyOfficeNumber ?? null,
    }
    const created = await createLocation(toCreate)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error("/api/location POST error:", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    )
  }
}
