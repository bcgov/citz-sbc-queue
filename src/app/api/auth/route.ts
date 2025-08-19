import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json(
    {
      message: "Authentication API - Please use one of the following endpoints:",
      endpoints: [
        "/api/auth/login - Login endpoint",
        "/api/auth/logout - Logout endpoint",
        "/api/auth/token - Token endpoint",
      ],
    },
    { status: 200 }
  )
}
