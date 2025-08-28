import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { UseDialogOptions } from "./types"
import { useDialog } from "./useDialog"

describe("useDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("initial state", () => {
    it("should initialize with defaultOpen as false when not provided", () => {
      const { result } = renderHook(() => useDialog())

      expect(result.current.open).toBe(false)
    })

    it("should initialize with defaultOpen as false when explicitly set", () => {
      const options: UseDialogOptions = { defaultOpen: false }
      const { result } = renderHook(() => useDialog(options))

      expect(result.current.open).toBe(false)
    })

    it("should initialize with defaultOpen as true when provided", () => {
      const options: UseDialogOptions = { defaultOpen: true }
      const { result } = renderHook(() => useDialog(options))

      expect(result.current.open).toBe(true)
    })

    it("should return all expected methods", () => {
      const { result } = renderHook(() => useDialog())

      expect(result.current).toHaveProperty("open")
      expect(result.current).toHaveProperty("setOpen")
      expect(result.current).toHaveProperty("openDialog")
      expect(result.current).toHaveProperty("closeDialog")
      expect(typeof result.current.setOpen).toBe("function")
      expect(typeof result.current.openDialog).toBe("function")
      expect(typeof result.current.closeDialog).toBe("function")
    })
  })

  describe("openDialog", () => {
    it("should set open to true", () => {
      const { result } = renderHook(() => useDialog())

      act(() => {
        result.current.openDialog()
      })

      expect(result.current.open).toBe(true)
    })

    it("should call onOpen callback when opening", () => {
      const onOpen = vi.fn()
      const options: UseDialogOptions = { onOpen }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.openDialog()
      })

      expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it("should not call onOpen callback when already open", () => {
      const onOpen = vi.fn()
      const options: UseDialogOptions = { defaultOpen: true, onOpen }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.openDialog()
      })

      expect(onOpen).not.toHaveBeenCalled()
    })
  })

  describe("closeDialog", () => {
    it("should set open to false", () => {
      const options: UseDialogOptions = { defaultOpen: true }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.closeDialog()
      })

      expect(result.current.open).toBe(false)
    })

    it("should call onClose callback when closing", () => {
      const onClose = vi.fn()
      const options: UseDialogOptions = { defaultOpen: true, onClose }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.closeDialog()
      })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("should not call onClose callback when already closed", () => {
      const onClose = vi.fn()
      const options: UseDialogOptions = { defaultOpen: false, onClose }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.closeDialog()
      })

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe("setOpen", () => {
    it("should open dialog when set to true", () => {
      const { result } = renderHook(() => useDialog())

      act(() => {
        result.current.setOpen(true)
      })

      expect(result.current.open).toBe(true)
    })

    it("should close dialog when set to false", () => {
      const options: UseDialogOptions = { defaultOpen: true }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.setOpen(false)
      })

      expect(result.current.open).toBe(false)
    })

    it("should call onOpen callback when setting to true", () => {
      const onOpen = vi.fn()
      const options: UseDialogOptions = { onOpen }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.setOpen(true)
      })

      expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it("should call onClose callback when setting to false", () => {
      const onClose = vi.fn()
      const options: UseDialogOptions = { defaultOpen: true, onClose }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.setOpen(false)
      })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("should not call callbacks when state doesn't change", () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const options: UseDialogOptions = { defaultOpen: false, onOpen, onClose }
      const { result } = renderHook(() => useDialog(options))

      // Try to set to the same state
      act(() => {
        result.current.setOpen(false)
      })

      expect(onOpen).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(result.current.open).toBe(false)
    })
  })

  describe("callback stability", () => {
    it("should maintain stable references for methods", () => {
      const { result, rerender } = renderHook(() => useDialog())

      const firstRender = {
        setOpen: result.current.setOpen,
        openDialog: result.current.openDialog,
        closeDialog: result.current.closeDialog,
      }

      rerender()

      expect(result.current.setOpen).toBe(firstRender.setOpen)
      expect(result.current.openDialog).toBe(firstRender.openDialog)
      expect(result.current.closeDialog).toBe(firstRender.closeDialog)
    })

    it("should update callbacks when options change", () => {
      const onOpen1 = vi.fn()
      const onOpen2 = vi.fn()

      const { result, rerender } = renderHook(
        ({ onOpen }: UseDialogOptions) => useDialog({ onOpen }),
        { initialProps: { onOpen: onOpen1 } }
      )

      const firstSetOpen = result.current.setOpen

      rerender({ onOpen: onOpen2 })

      // setOpen reference should change because of new callback
      expect(result.current.setOpen).not.toBe(firstSetOpen)

      // Test that the new callback is used
      act(() => {
        result.current.openDialog()
      })

      expect(onOpen1).not.toHaveBeenCalled()
      expect(onOpen2).toHaveBeenCalledTimes(1)
    })
  })

  describe("complex interactions", () => {
    it("should handle rapid open/close operations", () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const options: UseDialogOptions = { onOpen, onClose }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        result.current.openDialog()
        result.current.closeDialog()
        result.current.openDialog()
      })

      expect(result.current.open).toBe(true)
      expect(onOpen).toHaveBeenCalledTimes(2)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("should work correctly with both callback props", () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const options: UseDialogOptions = { onOpen, onClose }
      const { result } = renderHook(() => useDialog(options))

      // Open dialog
      act(() => {
        result.current.setOpen(true)
      })

      expect(result.current.open).toBe(true)
      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onClose).not.toHaveBeenCalled()

      // Close dialog
      act(() => {
        result.current.setOpen(false)
      })

      expect(result.current.open).toBe(false)
      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("should handle undefined callbacks gracefully", () => {
      const options: UseDialogOptions = {
        onOpen: undefined,
        onClose: undefined,
      }
      const { result } = renderHook(() => useDialog(options))

      // Should not throw errors
      expect(() => {
        act(() => {
          result.current.openDialog()
          result.current.closeDialog()
        })
      }).not.toThrow()
    })
  })

  describe("edge cases", () => {
    it("should work with empty options object", () => {
      const { result } = renderHook(() => useDialog({}))

      expect(result.current.open).toBe(false)

      act(() => {
        result.current.openDialog()
      })

      expect(result.current.open).toBe(true)
    })

    it("should work with no options provided", () => {
      const { result } = renderHook(() => useDialog())

      expect(result.current.open).toBe(false)

      act(() => {
        result.current.openDialog()
      })

      expect(result.current.open).toBe(true)
    })

    it("should handle multiple sequential state changes correctly", () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const options: UseDialogOptions = { onOpen, onClose }
      const { result } = renderHook(() => useDialog(options))

      act(() => {
        // Multiple calls in sequence
        result.current.setOpen(true)
        result.current.setOpen(true) // Should not trigger callback again
        result.current.setOpen(false)
        result.current.setOpen(false) // Should not trigger callback again
        result.current.setOpen(true)
      })

      expect(result.current.open).toBe(true)
      expect(onOpen).toHaveBeenCalledTimes(2) // Called twice: initially and after close
      expect(onClose).toHaveBeenCalledTimes(1) // Called once
    })
  })
})
