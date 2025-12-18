'use client'

import { createContext } from "react"

export const CurrentLocationContext =createContext<{
  location: Location | null
}>({
  location: null,
})
