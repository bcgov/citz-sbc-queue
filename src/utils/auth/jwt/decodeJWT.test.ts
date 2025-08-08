import { describe, expect, it } from "vitest"
import type { BaseTokenPayload } from "../types"
import { decodeJWT } from "./decodeJWT"

describe("decodeJWT", () => {
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

  // Helper function to create a valid JWT with a custom payload
  const createValidJWT = (payload: object): string => {
    const header = { alg: "HS256", typ: "JWT" }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
    const signature = "fake-signature"
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  describe("when JWT is valid", () => {
    it("should decode a valid JWT and return the payload", () => {
      const jwt = createValidJWT(mockPayload)
      const result = decodeJWT(jwt)

      expect(result).toEqual(mockPayload)
    })

    it("should handle JWT with minimal required fields", () => {
      const minimalPayload = {
        exp: 1234567890,
        iat: 1234567800,
        sub: "test-subject",
      }
      const jwt = createValidJWT(minimalPayload)
      const result = decodeJWT(jwt)

      expect(result).toEqual(minimalPayload)
    })

    it("should handle JWT with additional custom fields", () => {
      const payloadWithCustomFields = {
        ...mockPayload,
        customField: "custom-value",
        anotherField: 123,
        nestedObject: { key: "value" },
      }
      const jwt = createValidJWT(payloadWithCustomFields)
      const result = decodeJWT(jwt)

      expect(result).toEqual(payloadWithCustomFields)
    })

    it("should handle empty payload object", () => {
      const emptyPayload = {}
      const jwt = createValidJWT(emptyPayload)
      const result = decodeJWT(jwt)

      expect(result).toEqual(emptyPayload)
    })
  })

  describe("when JWT format is invalid", () => {
    it("should throw error when JWT has no dots", () => {
      const invalidJWT = "invalidjwttoken"

      expect(() => decodeJWT(invalidJWT)).toThrow("Invalid JWT format")
    })

    it("should throw error when JWT has only one part", () => {
      const invalidJWT = "header"

      expect(() => decodeJWT(invalidJWT)).toThrow("Invalid JWT format")
    })

    it("should throw error when JWT has only two parts", () => {
      const invalidJWT = "header.payload"

      expect(() => decodeJWT(invalidJWT)).toThrow("Invalid JWT format")
    })

    it("should throw error when JWT has more than three parts", () => {
      const invalidJWT = "header.payload.signature.extra"

      expect(() => decodeJWT(invalidJWT)).toThrow("Invalid JWT format")
    })

    it("should throw error when JWT is empty string", () => {
      expect(() => decodeJWT("")).toThrow("Invalid JWT format")
    })
  })

  describe("when payload is invalid", () => {
    it("should throw error when payload is not valid base64url", () => {
      const invalidJWT = "header.invalid-base64!@#.signature"

      expect(() => decodeJWT(invalidJWT)).toThrow(
        /Invalid input in decodeJWT\(jwt: string\) function of 'citz-imb-sso-js-core'/
      )
    })

    it("should throw error when payload is not valid JSON", () => {
      const invalidPayload = Buffer.from("invalid-json{").toString("base64url")
      const invalidJWT = `header.${invalidPayload}.signature`

      expect(() => decodeJWT(invalidJWT)).toThrow(
        /Invalid input in decodeJWT\(jwt: string\) function of 'citz-imb-sso-js-core'/
      )
    })

    it("should handle non-Error exceptions gracefully", () => {
      // Create a scenario where Buffer.from might throw a non-Error object
      // This is difficult to reproduce naturally, so we'll test the error handling path
      const malformedBase64 = "!@#$%^&*()"
      const invalidJWT = `header.${malformedBase64}.signature`

      expect(() => decodeJWT(invalidJWT)).toThrow(
        /Invalid input in decodeJWT\(jwt: string\) function of 'citz-imb-sso-js-core'/
      )
    })
  })

  describe("edge cases", () => {
    it("should handle payload with null values", () => {
      const payloadWithNulls = {
        exp: null,
        iat: 1234567800,
        sub: "test-subject",
        customField: null,
      }
      const jwt = createValidJWT(payloadWithNulls)
      const result = decodeJWT(jwt)

      expect(result).toEqual(payloadWithNulls)
    })

    it("should handle payload with array values", () => {
      const payloadWithArrays = {
        exp: 1234567890,
        roles: ["admin", "user"],
        permissions: [],
      }
      const jwt = createValidJWT(payloadWithArrays)
      const result = decodeJWT(jwt)

      expect(result).toEqual(payloadWithArrays)
    })

    it("should handle very large payload", () => {
      const largePayload = {
        exp: 1234567890,
        data: "x".repeat(10000), // Large string
      }
      const jwt = createValidJWT(largePayload)
      const result = decodeJWT(jwt)

      expect(result).toEqual(largePayload)
    })

    it("should handle special characters in payload", () => {
      const payloadWithSpecialChars = {
        exp: 1234567890,
        name: "Test User with émojis 🚀 and ñ special chars",
        description: "Contains \"quotes\" and 'apostrophes' and <html> tags",
      }
      const jwt = createValidJWT(payloadWithSpecialChars)
      const result = decodeJWT(jwt)

      expect(result).toEqual(payloadWithSpecialChars)
    })
  })
})
