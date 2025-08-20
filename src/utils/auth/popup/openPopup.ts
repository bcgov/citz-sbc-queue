// Returns the Window or null if blocked by the browser.

export const openPopup = (
  url: string,
  name = "AuthPopup",
  width = 800,
  height = 600
): Window | null => {
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)

  // Must be called directly inside a user gesture (e.g., onClick) to avoid blocking
  const win = window.open(url, name, `width=${width},height=${height},left=${left},top=${top}`)

  // If blocked, window.open returns null
  if (!win) return null

  try {
    // Bring window to foreground
    win.focus()
  } catch {
    // ignore
  }
  return win
}
