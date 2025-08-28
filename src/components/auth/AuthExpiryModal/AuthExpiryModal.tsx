"use client"

import {
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import { LoginButton } from "../LoginButton"
import LogoutButton from "../LogoutButton"
import { useAuthExpiry } from "./useAuthExpiry"

/**
 * Modal that appears when the user's session is about to expire.
 * Displays a 2-minute countdown and allows the user to login to extend their session.
 */
export const AuthExpiryModal = () => {
  const { showExpiryWarning, timeRemaining, formatTime } = useAuthExpiry()

  return (
    <Modal
      open={showExpiryWarning}
      onClose={() => {
        /* No-op close handler */
      }}
      disableEscapeKeyClose={true}
    >
      <DialogHeader>
        <DialogTitle>Session Expiring Soon</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <div className="space-y-4">
          <p>Your session is about to expire. You will be automatically logged out in:</p>

          <div className="text-center">
            <div className="text-3xl font-bold text-gold-800 mb-2">{formatTime(timeRemaining)}</div>
            <p className="text-sm text-gray-600">Click "Stay Logged In" to extend your session</p>
          </div>
        </div>
      </DialogBody>

      <DialogActions>
        <LogoutButton variant="tertiary" />
        <LoginButton text="Stay Logged In" />
      </DialogActions>
    </Modal>
  )
}

export default AuthExpiryModal
