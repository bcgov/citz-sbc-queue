import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { pollPopupLogin } from "./pollPopupLogin"

describe("pollPopupLogin", () => {
  let popup: Window
  let mockCookie: string

  beforeEach(() => {
    mockCookie = ""

    // Mock document.cookie getter
    Object.defineProperty(document, "cookie", {
      get: () => mockCookie,
      configurable: true,
    })

    popup = {
      closed: false,
      location: {
        origin: window.location.origin,
        pathname: "/api/auth/login/callback",
      },
      document: {
        readyState: "complete",
      },
      close: vi.fn(),
    } as unknown as Window
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("resolves with tokens when cookies are present", async () => {
    // Set mock cookies
    mockCookie = "access_token=abc; expires_in=3600; refresh_expires_in=7200; id_token=xyz"

    const result = await pollPopupLogin(popup)
    expect(result).toEqual({
      access_token: "abc",
      expires_in: 3600,
      refresh_expires_in: 7200,
      id_token: "xyz",
    })
    expect(popup.close).toHaveBeenCalled()
  })

  it("rejects if popup is closed early", async () => {
    Object.defineProperty(popup, "closed", { value: true })
    await expect(pollPopupLogin(popup)).rejects.toThrow("Popup closed")
    expect(popup.close).toHaveBeenCalled()
  })

  it("rejects if required cookies are missing", async () => {
    // Set incomplete cookies (missing id_token)
    mockCookie = "access_token=abc; expires_in=3600; refresh_expires_in=7200"

    await expect(pollPopupLogin(popup)).rejects.toThrow("Required authentication cookies not found")
    expect(popup.close).toHaveBeenCalled()
  })

  it("rejects if no cookies are present", async () => {
    // Empty cookies
    mockCookie = ""

    await expect(pollPopupLogin(popup)).rejects.toThrow("Required authentication cookies not found")
    expect(popup.close).toHaveBeenCalled()
  })

  it("parses numeric cookie values correctly", async () => {
    // Set cookies with string numeric values
    mockCookie = "access_token=abc; expires_in=1800; refresh_expires_in=3600; id_token=xyz"

    const result = await pollPopupLogin(popup)
    expect(result).toEqual({
      access_token: "abc",
      expires_in: 1800,
      refresh_expires_in: 3600,
      id_token: "xyz",
    })
    expect(typeof result.expires_in).toBe("number")
    expect(typeof result.refresh_expires_in).toBe("number")
  })

  it("waits for popup to be on callback URL before reading cookies", async () => {
    // Start with popup not on callback URL
    Object.defineProperty(popup, "location", {
      value: {
        origin: window.location.origin,
        pathname: "/some/other/path",
      },
    })

    // Set mock cookies
    mockCookie = "access_token=abc; expires_in=3600; refresh_expires_in=7200; id_token=xyz"

    // Start the polling
    const promise = pollPopupLogin(popup)

    // Simulate popup navigating to callback URL after some time
    setTimeout(() => {
      Object.defineProperty(popup, "location", {
        value: {
          origin: window.location.origin,
          pathname: "/api/auth/login/callback",
        },
      })
    }, 100)

    const result = await promise
    expect(result).toEqual({
      access_token: "abc",
      expires_in: 3600,
      refresh_expires_in: 7200,
      id_token: "xyz",
    })
  })
})
