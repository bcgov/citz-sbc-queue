import { describe, expect, it } from "vitest"
import { getLoginURL } from "./getLoginURL"

describe("getLoginURL", () => {
  const defaultProps = {
    idpHint: "idir",
    clientID: "test-client-id",
    redirectURI: "https://example.com/callback",
  }

  describe("with default configuration", () => {
    it("should generate correct login URL with default parameters", () => {
      const result = getLoginURL(defaultProps)

      expect(result).toBe(
        "https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/auth?" +
          "client_id=test-client-id&response_type=code&scope=email+openid&kc_idp_hint=idir&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback"
      )
    })

    it("should use dev environment by default", () => {
      const result = getLoginURL(defaultProps)

      expect(result).toContain("https://dev.loginproxy.gov.bc.ca/auth")
    })

    it("should use standard realm by default", () => {
      const result = getLoginURL(defaultProps)

      expect(result).toContain("/realms/standard/")
    })

    it("should use openid-connect protocol by default", () => {
      const result = getLoginURL(defaultProps)

      expect(result).toContain("/protocol/openid-connect/")
    })

    it("should use code response type by default", () => {
      const result = getLoginURL(defaultProps)

      expect(result).toContain("response_type=code")
    })

    it("should use email+openid scope by default", () => {
      const result = getLoginURL(defaultProps)

      expect(result).toContain("scope=email+openid")
    })
  })

  describe("with custom environment configurations", () => {
    it("should use test environment when specified", () => {
      const result = getLoginURL({
        ...defaultProps,
        ssoEnvironment: "test",
      })

      expect(result).toContain("https://test.loginproxy.gov.bc.ca/auth")
    })

    it("should use prod environment when specified", () => {
      const result = getLoginURL({
        ...defaultProps,
        ssoEnvironment: "prod",
      })

      expect(result).toContain("https://loginproxy.gov.bc.ca/auth")
    })
  })

  describe("with custom realm configurations", () => {
    it("should use custom realm when specified", () => {
      const result = getLoginURL({
        ...defaultProps,
        ssoRealm: "custom-realm",
      })

      expect(result).toContain("/realms/custom-realm/")
    })
  })

  describe("with custom protocol configurations", () => {
    it("should use saml protocol when specified", () => {
      const result = getLoginURL({
        ...defaultProps,
        ssoProtocol: "saml",
      })

      expect(result).toContain("/protocol/saml/")
    })
  })

  describe("with custom response type", () => {
    it("should use custom response type when specified", () => {
      const result = getLoginURL({
        ...defaultProps,
        responseType: "token",
      })

      expect(result).toContain("response_type=token")
    })

    it("should use custom response type with id_token", () => {
      const result = getLoginURL({
        ...defaultProps,
        responseType: "id_token token",
      })

      expect(result).toContain("response_type=id_token token")
    })
  })

  describe("with custom scope", () => {
    it("should use custom scope when specified", () => {
      const result = getLoginURL({
        ...defaultProps,
        scope: "openid profile email",
      })

      expect(result).toContain("scope=openid profile email")
    })

    it("should handle empty scope", () => {
      const result = getLoginURL({
        ...defaultProps,
        scope: "",
      })

      expect(result).toContain("scope=")
    })
  })

  describe("with different IDP hints", () => {
    it("should handle idir IDP hint", () => {
      const result = getLoginURL({
        ...defaultProps,
        idpHint: "idir",
      })

      expect(result).toContain("kc_idp_hint=idir")
    })

    it("should handle bceid IDP hint", () => {
      const result = getLoginURL({
        ...defaultProps,
        idpHint: "bceidbasic",
      })

      expect(result).toContain("kc_idp_hint=bceidbasic")
    })

    it("should handle github IDP hint", () => {
      const result = getLoginURL({
        ...defaultProps,
        idpHint: "githubbcgov",
      })

      expect(result).toContain("kc_idp_hint=githubbcgov")
    })
  })

  describe("with special characters in parameters", () => {
    it("should properly encode redirect URI with special characters", () => {
      const result = getLoginURL({
        ...defaultProps,
        redirectURI: "https://example.com/callback?param=value&other=test",
      })

      expect(result).toContain(
        "redirect_uri=https%3A%2F%2Fexample.com%2Fcallback%3Fparam%3Dvalue%26other%3Dtest"
      )
    })

    it("should handle special characters in client ID", () => {
      const result = getLoginURL({
        ...defaultProps,
        clientID: "client-id&special=chars",
      })

      expect(result).toContain("client_id=client-id&special=chars")
    })

    it("should handle special characters in IDP hint", () => {
      const result = getLoginURL({
        ...defaultProps,
        idpHint: "custom+idp/hint",
      })

      expect(result).toContain("kc_idp_hint=custom+idp/hint")
    })

    it("should handle special characters in scope", () => {
      const result = getLoginURL({
        ...defaultProps,
        scope: "openid+profile email/test",
      })

      expect(result).toContain("scope=openid+profile email/test")
    })
  })

  describe("edge cases", () => {
    it("should handle empty string values", () => {
      const result = getLoginURL({
        idpHint: "",
        clientID: "",
        redirectURI: "",
      })

      expect(result).toContain("client_id=")
      expect(result).toContain("kc_idp_hint=")
      expect(result).toContain("redirect_uri=")
    })

    it("should build complete URL with all custom parameters", () => {
      const result = getLoginURL({
        idpHint: "custom-idp",
        clientID: "custom-client",
        responseType: "id_token",
        scope: "custom+scope",
        redirectURI: "https://custom.example.com/auth",
        ssoEnvironment: "prod",
        ssoRealm: "custom-realm",
        ssoProtocol: "saml",
      })

      expect(result).toBe(
        "https://loginproxy.gov.bc.ca/auth/realms/custom-realm/protocol/saml/auth?" +
          "client_id=custom-client&response_type=id_token&scope=custom+scope&kc_idp_hint=custom-idp&redirect_uri=https%3A%2F%2Fcustom.example.com%2Fauth"
      )
    })

    it("should maintain parameter order consistently", () => {
      const result = getLoginURL(defaultProps)
      const params = result.split("?")[1].split("&")

      expect(params[0]).toContain("client_id=")
      expect(params[1]).toContain("response_type=")
      expect(params[2]).toContain("scope=")
      expect(params[3]).toContain("kc_idp_hint=")
      expect(params[4]).toContain("redirect_uri=")
    })

    it("should handle very long parameter values", () => {
      const longRedirectURI = `https://example.com/callback?param=${"x".repeat(1000)}`
      const result = getLoginURL({
        ...defaultProps,
        redirectURI: longRedirectURI,
      })

      expect(result).toContain(`redirect_uri=${encodeURIComponent(longRedirectURI)}`)
    })
  })
})
