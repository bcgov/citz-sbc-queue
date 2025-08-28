import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth/store"

const EXPIRY_WARNING_DURATION_SECONDS = 120 // 2 minutes

export type UseAuthExpiryReturn = {
  showExpiryWarning: boolean
  timeRemaining: number
  formatTime: (seconds: number) => string
}

/**
 * Hook for managing authentication expiry warning state and countdown timer.
 *
 * To test manually, temporarily set `TEN_HOURS_MS = 3 * 60 * 1000` in `src/stores/auth/store.ts`.
 * This will open the expiry modal after 1 minutes, leaving the modal open for another 2 minutes.
 *
 * @returns Object containing expiry warning state, time remaining, and time formatting function
 */
export const useAuthExpiry = (): UseAuthExpiryReturn => {
  const showExpiryWarning = useAuthStore((s) => s.showExpiryWarning)
  const [timeRemaining, setTimeRemaining] = useState(EXPIRY_WARNING_DURATION_SECONDS)

  // Reset countdown when modal opens
  useEffect(() => {
    if (showExpiryWarning) {
      setTimeRemaining(EXPIRY_WARNING_DURATION_SECONDS)
    }
  }, [showExpiryWarning])

  // Countdown timer
  useEffect(() => {
    if (!showExpiryWarning || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [showExpiryWarning, timeRemaining])

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return {
    showExpiryWarning,
    timeRemaining,
    formatTime,
  }
}
