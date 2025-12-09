import { useContext } from "react"
import { CurrentLocationContext } from "./CurrentLocationContext"

export function useCurrentLocation() {
  return useContext(CurrentLocationContext)
}
