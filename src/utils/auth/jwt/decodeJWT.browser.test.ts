import { describe, expect, it } from "vitest"
import type { BaseTokenPayload } from "../types"
import { decodeJWTBrowser } from "./decodeJWT.browser"

describe("decodeJWTBrowser", () => {
  const mockPayload: BaseTokenPayload<unknown> = {
    exp: 1234567890,
    iat: 1234567800,
    auth_time: 1234567800,
    jti: "test-jti",
    iss: "test-issuer",
    aud: "test-audience",
    sub: "test-subject",
    typ: "Bearer",
    azp: "test-azp",
    nonce: "test-nonce",
    session_state: "test-session",
    sid: "test-sid",
    identity_provider: "idir",
    email_verified: true,
    preferred_username: "testuser",
  }

  const createValidJWT = (payload: object): string => {
    const header = { alg: "HS256", typ: "JWT" }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
    const signature = "fake-signature"
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  it("decodes a valid JWT and returns the payload", () => {
    const jwt = createValidJWT(mockPayload)
    const result = decodeJWTBrowser(jwt)

    expect(result).toEqual(mockPayload)
  })

  it("throws on invalid JWT format", () => {
    expect(() => decodeJWTBrowser("")).toThrow("Invalid JWT format")
    expect(() => decodeJWTBrowser("no.dots")).toThrow("Invalid JWT format")
    expect(() => decodeJWTBrowser("onepart")).toThrow("Invalid JWT format")
  })

  it("throws when payload is invalid base64url", () => {
    const invalidJWT = "header.invalid-base64!@#.signature"
    expect(() => decodeJWTBrowser(invalidJWT)).toThrow(/Failed to decode JWT in browser/)
  })

  it("throws when payload is not valid JSON", () => {
    const invalidPayload = Buffer.from("invalid-json{").toString("base64url")
    const invalidJWT = `header.${invalidPayload}.signature`
    expect(() => decodeJWTBrowser(invalidJWT)).toThrow(/Failed to decode JWT in browser/)
  })
})
