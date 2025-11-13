"use client"

import { useAuth } from "@/hooks"

type Props = {
  hasRole?: string
  children: React.ReactNode
}

export const IsAuthenticated = (props: Props) => {
  const { hasRole, children } = props

  const auth = useAuth()

  if (!hasRole && auth.isAuthenticated) return <>{children}</>

  if (hasRole && auth.hasRole(hasRole)) return <>{children}</>

  return null
}

export default IsAuthenticated
