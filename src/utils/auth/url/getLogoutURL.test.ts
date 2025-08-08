import { describe, expect, it } from "vitest"
import { getLogoutURL } from "./getLogoutURL"

describe("getLogoutURL", () => {
  const defaultProps = {
    idToken: "test.id.token",
    postLogoutRedirectURI: "https://example.com/logged-out",
  }

  describe("with default configuration", () => {
    it("should generate correct logout URL with default parameters", () => {
      const result = getLogoutURL(defaultProps)

      expect(result).toBe(
        "https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi?" +
          "retnow=1&returl=https%3A%2F%2Fdev.loginproxy.gov.bc.ca%2Fauth%2Frealms%2Fstandard%2Fprotocol%2Fopenid-connect%2Flogout%3Fid_token_hint%3Dtest.id.token%26post_logout_redirect_uri%3Dhttps%253A%252F%252Fexample.com%252Flogged-out"
      )
    })

    it("should use dev environment by default", () => {
      const result = getLogoutURL(defaultProps)

      expect(result).toContain("https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi")
    })

    it("should use standard realm by default", () => {
      const result = getLogoutURL(defaultProps)

      expect(result).toContain("%2Frealms%2Fstandard%2F")
    })

    it("should use openid-connect protocol by default", () => {
      const result = getLogoutURL(defaultProps)

      expect(result).toContain("%2Fprotocol%2Fopenid-connect%2F")
    })

    it("should include retnow=1 parameter", () => {
      const result = getLogoutURL(defaultProps)

      expect(result).toContain("retnow=1")
    })
  })

  describe("with different environment configurations", () => {
    it("should use test environment logout URL when specified", () => {
      const result = getLogoutURL({
        ...defaultProps,
        ssoEnvironment: "test",
      })

      expect(result).toContain("https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi")
    })

    it("should use prod environment logout URL when specified", () => {
      const result = getLogoutURL({
        ...defaultProps,
        ssoEnvironment: "prod",
      })

      expect(result).toContain("https://logon7.gov.bc.ca/clp-cgi/logoff.cgi")
    })

    it("should use correct auth URL for test environment", () => {
      const result = getLogoutURL({
        ...defaultProps,
        ssoEnvironment: "test",
      })

      expect(result).toContain("https%3A%2F%2Ftest.loginproxy.gov.bc.ca%2Fauth")
    })

    it("should use correct auth URL for prod environment", () => {
      const result = getLogoutURL({
        ...defaultProps,
        ssoEnvironment: "prod",
      })

      expect(result).toContain("https%3A%2F%2Floginproxy.gov.bc.ca%2Fauth")
    })
  })

  describe("with custom realm configurations", () => {
    it("should use custom realm when specified", () => {
      const result = getLogoutURL({
        ...defaultProps,
        ssoRealm: "custom-realm",
      })

      expect(result).toContain("%2Frealms%2Fcustom-realm%2F")
    })
  })

  describe("with custom protocol configurations", () => {
    it("should use saml protocol when specified", () => {
      const result = getLogoutURL({
        ...defaultProps,
        ssoProtocol: "saml",
      })

      expect(result).toContain("%2Fprotocol%2Fsaml%2F")
    })
  })

  describe("with special characters in parameters", () => {
    it("should properly encode post logout redirect URI with special characters", () => {
      const result = getLogoutURL({
        ...defaultProps,
        postLogoutRedirectURI: "https://example.com/logged-out?param=value&other=test",
      })

      expect(result).toContain(
        "post_logout_redirect_uri%3Dhttps%253A%252F%252Fexample.com%252Flogged-out%253Fparam%253Dvalue%2526other%253Dtest"
      )
    })

    it("should handle special characters in ID token", () => {
      const result = getLogoutURL({
        ...defaultProps,
        idToken: "header.payload+with/special=chars.signature",
      })

      expect(result).toContain("id_token_hint%3Dheader.payload%2Bwith%2Fspecial%3Dchars.signature")
    })

    it("should handle complex nested encoding", () => {
      const postLogoutURI = "https://app.example.com/auth/callback?state=abc123&return=/dashboard"
      const result = getLogoutURL({
        ...defaultProps,
        postLogoutRedirectURI: postLogoutURI,
      })

      // The URI should be double-encoded due to the nested structure
      expect(result).toContain(encodeURIComponent(encodeURIComponent(postLogoutURI)))
    })
  })

  describe("URL structure validation", () => {
    it("should have correct SiteMinder and Keycloak parameter structure", () => {
      const result = getLogoutURL(defaultProps)

      // Should start with SiteMinder logout URL
      expect(result).toMatch(/^https:\/\/logontest7\.gov\.bc\.ca\/clp-cgi\/logoff\.cgi\?/)

      // Should contain retnow parameter
      expect(result).toContain("retnow=1")

      // Should contain returl parameter with encoded Keycloak logout URL
      expect(result).toContain("returl=")

      // The returl should contain the Keycloak logout endpoint
      const decodedReturl = decodeURIComponent(result.split("returl=")[1])
      expect(decodedReturl).toContain("/logout?")
      expect(decodedReturl).toContain("id_token_hint=")
      expect(decodedReturl).toContain("post_logout_redirect_uri=")
    })

    it("should properly separate SiteMinder and Keycloak parameters", () => {
      const result = getLogoutURL(defaultProps)

      // Extract the main URL parts
      const [siteMinderBase, siteMinderParams] = result.split("?")
      const params = new URLSearchParams(siteMinderParams)

      expect(siteMinderBase).toBe("https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi")
      expect(params.get("retnow")).toBe("1")
      expect(params.get("returl")).toBeTruthy()

      // Decode and validate the Keycloak URL
      const returl = params.get("returl")
      expect(returl).toBeTruthy()
      const keycloakURL = decodeURIComponent(returl as string)
      const [keycloakBase, keycloakParams] = keycloakURL.split("?")
      const kcParams = new URLSearchParams(keycloakParams)

      expect(keycloakBase).toContain("/logout")
      expect(kcParams.get("id_token_hint")).toBe("test.id.token")
      expect(kcParams.get("post_logout_redirect_uri")).toBe("https://example.com/logged-out")
    })
  })

  describe("edge cases", () => {
    it("should handle empty string values", () => {
      const result = getLogoutURL({
        idToken: "",
        postLogoutRedirectURI: "",
      })

      expect(result).toContain("id_token_hint%3D")
      expect(result).toContain("post_logout_redirect_uri%3D")
    })

    it("should build complete URL with all custom parameters", () => {
      const result = getLogoutURL({
        idToken: "custom.jwt.token",
        postLogoutRedirectURI: "https://custom.app.com/logout-complete",
        ssoEnvironment: "prod",
        ssoRealm: "custom-realm",
        ssoProtocol: "saml",
      })

      expect(result).toContain("https://logon7.gov.bc.ca/clp-cgi/logoff.cgi")
      expect(result).toContain(
        "https%3A%2F%2Floginproxy.gov.bc.ca%2Fauth%2Frealms%2Fcustom-realm%2Fprotocol%2Fsaml%2Flogout"
      )
      expect(result).toContain("id_token_hint%3Dcustom.jwt.token")
      expect(result).toContain(
        "post_logout_redirect_uri%3Dhttps%253A%252F%252Fcustom.app.com%252Flogout-complete"
      )
    })

    it("should handle very long parameter values", () => {
      const longToken = `header.${"x".repeat(1000)}.signature`
      const longRedirectURI = `https://example.com/logout?param=${"y".repeat(500)}`

      const result = getLogoutURL({
        idToken: longToken,
        postLogoutRedirectURI: longRedirectURI,
      })

      expect(result).toContain(`id_token_hint%3D${longToken}`)
      expect(result).toContain(encodeURIComponent(encodeURIComponent(longRedirectURI)))
    })

    it("should maintain consistent parameter order", () => {
      const result = getLogoutURL(defaultProps)
      const siteMinderParams = result.split("?")[1]
      const params = siteMinderParams.split("&")

      expect(params[0]).toContain("retnow=1")
      expect(params[1]).toContain("returl=")
    })

    it("should handle URLs with fragments and complex query strings", () => {
      const complexURI = "https://app.com/logout?success=true&redirect=/home#section"
      const result = getLogoutURL({
        ...defaultProps,
        postLogoutRedirectURI: complexURI,
      })

      // Should be properly double-encoded
      expect(result).toContain(encodeURIComponent(encodeURIComponent(complexURI)))
    })
  })
})
