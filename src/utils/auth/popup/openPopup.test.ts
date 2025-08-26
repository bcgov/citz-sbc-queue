import { beforeEach, describe, expect, it, vi } from "vitest"
import { openPopup } from "./openPopup"

describe("openPopup", () => {
  beforeEach(() => {
    // @ts-ignore
    global.window = Object.create(window)
    window.open = vi.fn(() => ({ focus: vi.fn() }) as unknown as Window)
    window.screenX = 0
    window.screenY = 0
    window.outerWidth = 1024
    window.outerHeight = 768
  })

  it("opens a popup and focuses it", () => {
    const win = openPopup("/test-url", "TestPopup", 400, 300)
    expect(window.open).toHaveBeenCalledWith(
      "/test-url",
      "TestPopup",
      expect.stringContaining("width=400")
    )
    expect(win).not.toBeNull()
    expect(win?.focus).toBeDefined()
  })

  it("returns null if popup is blocked", () => {
    window.open = vi.fn(() => null)
    const win = openPopup("/test-url")
    expect(win).toBeNull()
  })
})
