import { beforeEach, describe, expect, it, vi } from "vitest"
import { pollPopupLogin } from "./pollPopupLogin"

describe("pollPopupLogin", () => {
  let popup: Window

  beforeEach(() => {
    popup = {
      closed: false,
      location: {
        origin: window.location.origin,
        pathname: "/api/auth/login/callback",
      },
      document: {
        readyState: "complete",
        body: { textContent: "" },
        querySelector: vi.fn(() => ({
          textContent:
            '{"access_token":"abc","expires_in":3600,"refresh_expires_in":7200,"id_token":"xyz"}',
        })),
      },
      close: vi.fn(),
    } as unknown as Window
  })

  it("resolves with tokens when callback JSON is present", async () => {
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

  it("rejects if callback content is empty", async () => {
    popup.document.querySelector = vi.fn(() => ({ textContent: "" }))
    popup.document.body.textContent = ""
    Object.defineProperty(popup.document, "documentElement", { value: { textContent: "" } })
    await expect(pollPopupLogin(popup)).rejects.toThrow("Callback content empty")
    expect(popup.close).toHaveBeenCalled()
  })
})
