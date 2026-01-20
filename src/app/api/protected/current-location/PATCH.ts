import { type NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/utils/auth/getAuthContext"
import type {
  UpdateCurrentLocationRequest,
  UpdateCurrentLocationResponse,
} from "@/utils/location/types"
import { updateStaffUserLocation } from "@/utils/staffUser"

export async function PATCH(request: NextRequest) {
  try {
    const authContext = getAuthContext(request)

    if (!authContext) {
      const response: UpdateCurrentLocationResponse = {
        success: false,
        error: "Unauthorized - No valid authentication found",
      }
      return NextResponse.json(response, { status: 401 })
    }

    const body = (await request.json()) as UpdateCurrentLocationRequest

    if (!body || !Object.hasOwn(body, "locationId")) {
      const response: UpdateCurrentLocationResponse = {
        success: false,
        error: "Invalid request body",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const updated = await updateStaffUserLocation(authContext.user.idir_user_guid, body.locationId)

    if (!updated) {
      const response: UpdateCurrentLocationResponse = {
        success: false,
        error: "Staff user not found",
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: UpdateCurrentLocationResponse = {
      success: true,
      data: {
        locationId: updated.locationId,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error in protected current-location PATCH route:", error)
    const response: UpdateCurrentLocationResponse = {
      success: false,
      error: "Internal server error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
