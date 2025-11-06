import type { SSOIdirUser } from "../types"

/**
 * Convert a base64url string to standard base64 with padding.
 */
function base64UrlToBase64(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const pad = base64.length % 4
  if (pad === 2) base64 += "=="
  else if (pad === 3) base64 += "="
  else if (pad !== 0) throw new Error("Invalid base64url string")
  return base64
}

/**
 * Decode a base64 string to a UTF-8 string in the browser.
 */
function base64ToUtf8(base64: string): string {
  // atob is available in browsers; in some test environments it may be polyfilled.
  const binaryString = typeof atob !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("binary")

  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes)
  }

  // Fallback for very old environments
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return decodeURIComponent(escape(binaryString))
}

export const decodeJWTBrowser = (jwt: string): SSOIdirUser => {
  if (!jwt || typeof jwt !== "string") throw new Error("Invalid JWT")

  const parts = jwt.split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT format")

  const base64UrlPayload = parts[1]
  try {
    const base64 = base64UrlToBase64(base64UrlPayload)
    const jsonStr = base64ToUtf8(base64)
    return JSON.parse(jsonStr) as SSOIdirUser
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to decode JWT in browser: ${error.message}`)
    }
    throw new Error("Unknown error decoding JWT in browser")
  }
}
