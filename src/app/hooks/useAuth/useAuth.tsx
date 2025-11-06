"use client"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth/store"
import { decodeJWT } from "@/utils/auth/jwt/decodeJWT"

export const useAuth = () => {
  const accessToken = useAuthStore((s) => s.session?.accessToken)

  useEffect(() => {
    console.log("Current accessToken:", accessToken)

    if (accessToken) {
      const decoded = decodeJWT(accessToken)
      console.log("Decoded JWT:", decoded)
    }
  }, [accessToken])

  return !!accessToken
}
