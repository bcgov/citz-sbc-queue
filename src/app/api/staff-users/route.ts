import { getAllStaffUsers } from "@/lib/prisma/staff_user/getAllStaffUsers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const users = await getAllStaffUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching staff users:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff users" },
      { status: 500 }
    )
  }
}
