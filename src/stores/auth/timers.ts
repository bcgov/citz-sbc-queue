import type { Session } from "./types"

let accessRefreshTO: NodeJS.Timeout | null = null
let sessionWarnTO: NodeJS.Timeout | null = null
let sessionLogoutTO: NodeJS.Timeout | null = null

export const clearAuthTimers = (): void => {
  if (accessRefreshTO) clearTimeout(accessRefreshTO)
  if (sessionWarnTO) clearTimeout(sessionWarnTO)
  if (sessionLogoutTO) clearTimeout(sessionLogoutTO)
  accessRefreshTO = sessionWarnTO = sessionLogoutTO = null
}

type ScheduleArgs = {
  getSession: () => Session | null
  onRefresh: () => Promise<boolean>
  onShowWarning: () => void
  onHardLogout: () => Promise<void>
}

export const scheduleAuthTimers = ({
  getSession,
  onRefresh,
  onShowWarning,
  onHardLogout,
}: ScheduleArgs): void => {
  clearAuthTimers()
  const session = getSession()
  if (!session) return

  const now = Date.now()

  // Background access-token refresh ~45s before access expiry
  const refreshIn = Math.max(1_000, session.accessExpiresAt - now - 45_000)
  accessRefreshTO = setTimeout(async () => {
    const ok = await onRefresh()
    if (!ok) {
      await onHardLogout()
    }
  }, refreshIn)

  // Session warning at T-2m+2s, hard logout at T
  const warnIn = Math.max(1_000, session.sessionEndsAt - now - 122_000)
  const logoutIn = Math.max(1_000, session.sessionEndsAt - now)

  sessionWarnTO = setTimeout(() => onShowWarning(), warnIn)
  sessionLogoutTO = setTimeout(async () => {
    await onHardLogout()
  }, logoutIn)
}
