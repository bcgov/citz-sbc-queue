"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth/store"

/**
 * When the app is returned to after SSO logout, the redirect includes
 * ?post_logout=true — this component calls the auth store logout to clear
 * client-side session state.
 */
export const LogoutHandler = () => {
  const params = useSearchParams()
  const router = useRouter()
  const storeLogout = useAuthStore((state) => state.logout)

  useEffect(() => {
    if (!params) return
    const postLogout = params.get("post_logout")

    if (postLogout === "true") {
      // store.logout clears timers and client state
      storeLogout("manual")

      // Remove query param to avoid repeated calls
      const url = new URL(window.location.href)
      url.searchParams.delete("post_logout")
      router.replace(url.pathname + url.search + url.hash)
    }
  }, [params, storeLogout, router])

  return null
}

export default LogoutHandler
