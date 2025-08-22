let popupRef: Window | null = null

/**
 * Opens a popup window for user authentication.
 * @param url The URL to open in the popup.
 * @param name The name of the popup window.
 * @param width The width of the popup window.
 * @param height The height of the popup window.
 * @returns The opened popup window or null if blocked.
 */
export const openPopup = (
  url: string,
  name = "AuthPopup",
  width = 800,
  height = 600
): Window | null => {
  // Reuse existing popup if still open. Only reuse when closed === false.
  if (popupRef && popupRef.closed === false) {
    try {
      popupRef.focus()
      return popupRef
    } catch {
      // ignore and attempt to recreate
    }
  }

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

  popupRef = win
  return win
}
