import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getAuthContext } from "@/utils/auth/getAuthContext"
import { getAllLocations } from "@/utils/location/getAllLocations"
import type { GetAllLocationsResponse, LocationDto } from "@/utils/location/types"

export async function GET(request: NextRequest) {
  try {
    const authContext = getAuthContext(request)

    if (!authContext) {
      const response: GetAllLocationsResponse = {
        success: false,
        error: "Unauthorized - No valid authentication found",
      }
      return NextResponse.json(response, { status: 401 })
    }

    const locations = await getAllLocations()

    const dto: LocationDto[] = locations.map((location) => ({
      id: location.id,
      name: location.name,
      timezone: location.timezone,
      streetAddress: location.streetAddress,
      mailAddress: location.mailAddress,
      phoneNumber: location.phoneNumber,
      latitude: location.latitude,
      longitude: location.longitude,
      legacyOfficeNumber: location.legacyOfficeNumber,
    }))

    const response: GetAllLocationsResponse = {
      success: true,
      data: {
        locations: dto,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error in protected locations route:", error)
    const response: GetAllLocationsResponse = {
      success: false,
      error: "Internal server error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
