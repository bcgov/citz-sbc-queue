import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getAuthContext } from "@/utils/auth/getAuthContext"

export async function GET(request: NextRequest) {
  try {
    const authContext = getAuthContext(request)

    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No valid authentication found" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: authContext.user,
        roles: authContext.roles,
        // Note: We don't return the raw token for security reasons
        hasToken: !!authContext.token,
      },
    })
  } catch (error) {
    console.error("Error in protected route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
