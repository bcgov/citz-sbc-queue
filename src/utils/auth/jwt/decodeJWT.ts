import type { BaseTokenPayload } from "../types"

export const decodeJWT = (jwt: string): BaseTokenPayload<unknown> => {
  const parts = jwt.split(".")
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format")
  }

  const base64Payload = parts[1]
  try {
    const decodedPayload = Buffer.from(base64Payload, "base64url").toString("utf-8")
    return JSON.parse(decodedPayload)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid input in decodeJWT(jwt: string): ${error.message}`)
    }
    throw new Error(`Unknown error occurred in decodeJWT()`)
  }
}
