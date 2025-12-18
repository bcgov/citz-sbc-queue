"use client"

import type { ReactNode } from "react"
import { CurrentLocationContext } from "./CurrentLocationContext"

export const CurrentLocationProvider = ({ children }: { children: ReactNode }) => {
  const location: Location | null = null

  return (
    <CurrentLocationContext.Provider value={{ location }}>
      {children}
    </CurrentLocationContext.Provider>
  )
}
