import { type NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/utils/auth/getAuthContext"
import type { CurrentLocationResponse, LocationDto } from "@/utils/location/types"
import { getStaffUserByGuid } from "@/utils/staffUser"

export async function GET(request: NextRequest) {
  try {
    const authContext = getAuthContext(request)

    if (!authContext) {
      const response: CurrentLocationResponse = {
        success: false,
        error: "Unauthorized - No valid authentication found",
      }
      return NextResponse.json(response, { status: 401 })
    }

    const staffUser = await getStaffUserByGuid(authContext.user.idir_user_guid)

    if (
      !staffUser ||
      !staffUser.locationId ||
      !staffUser.location ||
      staffUser.location.deletedAt
    ) {
      const response: CurrentLocationResponse = {
        success: true,
        data: {
          location: null,
        },
      }
      return NextResponse.json(response, { status: 200 })
    }

    const location: LocationDto = {
      id: staffUser.location.id,
      name: staffUser.location.name,
      timezone: staffUser.location.timezone,
      streetAddress: staffUser.location.streetAddress,
      mailAddress: staffUser.location.mailAddress,
      phoneNumber: staffUser.location.phoneNumber,
      latitude: staffUser.location.latitude,
      longitude: staffUser.location.longitude,
      legacyOfficeNumber: staffUser.location.legacyOfficeNumber,
    }

    const response: CurrentLocationResponse = {
      success: true,
      data: {
        location,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error in protected current-location route:", error)
    const response: CurrentLocationResponse = {
      success: false,
      error: "Internal server error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
