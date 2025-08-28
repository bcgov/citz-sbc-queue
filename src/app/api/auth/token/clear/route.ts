import { NextResponse } from "next/server"

const { NODE_ENV } = process.env

export async function POST() {
  try {
    const isProduction = NODE_ENV === "production"

    const response = NextResponse.json({ message: "Cleared token cookies." }, { status: 200 })

    // Clear the access token and refresh token cookies
    response.cookies.set("access_token", "", {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    // Clear the id token cookie
    response.cookies.set("id_token", "", {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    return response
  } catch (error) {
    console.error("Clear token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
