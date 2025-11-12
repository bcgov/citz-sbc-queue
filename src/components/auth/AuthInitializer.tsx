"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth/store"

/**
 * AuthInitializer component that initializes the authentication state.
 */
export const AuthInitializer = () => {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return null
}

export default AuthInitializer
