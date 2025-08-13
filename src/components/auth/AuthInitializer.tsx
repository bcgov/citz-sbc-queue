"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth/store"

export const AuthInitializer = () => {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return null
}
