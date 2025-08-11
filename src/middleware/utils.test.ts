import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { chain, conditional } from "./utils"

describe("middleware/utils", () => {
  const createMockRequest = (
    url = "https://example.com/api/test",
    headers: Record<string, string> = {}
  ): NextRequest => {
    const mockHeaders = new Headers(Object.entries(headers))

    return {
      url,
      nextUrl: { pathname: new URL(url).pathname },
      headers: {
        get: (name: string) => mockHeaders.get(name),
      },
    } as NextRequest
  }

  const createMockMiddleware = (_name: string, returnResponse?: NextResponse) => {
    const mockFn = vi.fn()
    if (returnResponse) {
      mockFn.mockResolvedValue(returnResponse)
    } else {
      mockFn.mockResolvedValue(NextResponse.next())
    }
    return mockFn
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("conditional", () => {
    const mockMiddleware = createMockMiddleware("test-middleware")
    const mockCondition = vi.fn()

    beforeEach(() => {
      mockMiddleware.mockClear()
      mockCondition.mockClear()
    })

    describe("when condition returns true", () => {
      beforeEach(() => {
        mockCondition.mockReturnValue(true)
      })

      it("should call the middleware function", async () => {
        const conditionalMiddleware = conditional(mockCondition, mockMiddleware)
        const request = createMockRequest()

        await conditionalMiddleware(request)

        expect(mockCondition).toHaveBeenCalledWith(request)
        expect(mockMiddleware).toHaveBeenCalledWith(request)
      })

      it("should return the middleware's response", async () => {
        const customResponse = NextResponse.json({ message: "custom response" })
        const customMiddleware = createMockMiddleware("custom", customResponse)
        const conditionalMiddleware = conditional(mockCondition, customMiddleware)
        const request = createMockRequest()

        const result = await conditionalMiddleware(request)

        expect(result).toBe(customResponse)
      })

      it("should handle middleware that returns NextResponse.next()", async () => {
        const conditionalMiddleware = conditional(mockCondition, mockMiddleware)
        const request = createMockRequest()

        const result = await conditionalMiddleware(request)

        expect(result).toEqual(NextResponse.next())
      })

      it("should handle async middleware", async () => {
        const expectedResponse = NextResponse.json({ async: true })
        const asyncMiddleware = vi.fn().mockResolvedValue(expectedResponse)
        const conditionalMiddleware = conditional(mockCondition, asyncMiddleware)
        const request = createMockRequest()

        const result = await conditionalMiddleware(request)

        expect(asyncMiddleware).toHaveBeenCalledWith(request)
        expect(result).toBe(expectedResponse)
      })
    })

    describe("when condition returns false", () => {
      beforeEach(() => {
        mockCondition.mockReturnValue(false)
      })

      it("should not call the middleware function", async () => {
        const conditionalMiddleware = conditional(mockCondition, mockMiddleware)
        const request = createMockRequest()

        await conditionalMiddleware(request)

        expect(mockCondition).toHaveBeenCalledWith(request)
        expect(mockMiddleware).not.toHaveBeenCalled()
      })

      it("should return NextResponse.next()", async () => {
        const conditionalMiddleware = conditional(mockCondition, mockMiddleware)
        const request = createMockRequest()

        const result = await conditionalMiddleware(request)

        expect(result).toEqual(NextResponse.next())
      })
    })

    describe("edge cases", () => {
      it("should handle condition function that throws an error", async () => {
        const errorCondition = vi.fn().mockImplementation(() => {
          throw new Error("Condition error")
        })
        const conditionalMiddleware = conditional(errorCondition, mockMiddleware)
        const request = createMockRequest()

        await expect(conditionalMiddleware(request)).rejects.toThrow("Condition error")
        expect(mockMiddleware).not.toHaveBeenCalled()
      })

      it("should handle middleware that throws an error when condition is true", async () => {
        mockCondition.mockReturnValue(true)
        const errorMiddleware = vi.fn().mockRejectedValue(new Error("Middleware error"))
        const conditionalMiddleware = conditional(mockCondition, errorMiddleware)
        const request = createMockRequest()

        await expect(conditionalMiddleware(request)).rejects.toThrow("Middleware error")
        expect(errorMiddleware).toHaveBeenCalledWith(request)
      })

      it("should handle different request objects", async () => {
        mockCondition.mockReturnValue(true)
        const conditionalMiddleware = conditional(mockCondition, mockMiddleware)
        const request = createMockRequest("https://different.com/path", {
          "custom-header": "value",
        })

        await conditionalMiddleware(request)

        expect(mockCondition).toHaveBeenCalledWith(request)
        expect(mockMiddleware).toHaveBeenCalledWith(request)
      })
    })
  })

  describe("chain", () => {
    describe("with single middleware", () => {
      it("should call the middleware and return its response", async () => {
        const middleware = createMockMiddleware("single")
        const chainedMiddleware = chain(middleware)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware).toHaveBeenCalledWith(request)
        expect(result).toEqual(NextResponse.next())
      })

      it("should return non-next response when middleware returns it", async () => {
        const customResponse = NextResponse.json({ error: "unauthorized" }, { status: 401 })
        const middleware = createMockMiddleware("single", customResponse)
        const chainedMiddleware = chain(middleware)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(result).toBe(customResponse)
      })
    })

    describe("with multiple middleware", () => {
      it("should call all middleware in order when all return NextResponse.next()", async () => {
        const middleware1 = createMockMiddleware("first")
        const middleware2 = createMockMiddleware("second")
        const middleware3 = createMockMiddleware("third")
        const chainedMiddleware = chain(middleware1, middleware2, middleware3)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware1).toHaveBeenCalledWith(request)
        expect(middleware2).toHaveBeenCalledWith(request)
        expect(middleware3).toHaveBeenCalledWith(request)
        expect(result).toEqual(NextResponse.next())
      })

      it("should stop chain and return response when middleware returns non-next response", async () => {
        const middleware1 = createMockMiddleware("first")
        const unauthorizedResponse = NextResponse.json({ error: "unauthorized" }, { status: 401 })
        const middleware2 = createMockMiddleware("second", unauthorizedResponse)
        const middleware3 = createMockMiddleware("third")
        const chainedMiddleware = chain(middleware1, middleware2, middleware3)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware1).toHaveBeenCalledWith(request)
        expect(middleware2).toHaveBeenCalledWith(request)
        expect(middleware3).not.toHaveBeenCalled()
        expect(result).toBe(unauthorizedResponse)
      })

      it("should handle mix of sync and async middleware", async () => {
        const syncMiddleware = vi.fn().mockReturnValue(NextResponse.next())
        const asyncMiddleware = vi.fn().mockResolvedValue(NextResponse.next())
        const chainedMiddleware = chain(syncMiddleware, asyncMiddleware)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(syncMiddleware).toHaveBeenCalledWith(request)
        expect(asyncMiddleware).toHaveBeenCalledWith(request)
        expect(result).toEqual(NextResponse.next())
      })
    })

    describe("response status and header detection", () => {
      it("should stop chain when response status is 200 but no x-middleware-next header", async () => {
        const response200 = new NextResponse(null, { status: 200 })
        const middleware1 = createMockMiddleware("first", response200)
        const middleware2 = createMockMiddleware("second")
        const chainedMiddleware = chain(middleware1, middleware2)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware1).toHaveBeenCalledWith(request)
        expect(middleware2).not.toHaveBeenCalledWith(request)
        expect(result).toBe(response200)
      })

      it("should stop chain when response status is not 200", async () => {
        const response404 = new NextResponse(null, { status: 404 })
        const middleware1 = createMockMiddleware("first", response404)
        const middleware2 = createMockMiddleware("second")
        const chainedMiddleware = chain(middleware1, middleware2)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware1).toHaveBeenCalledWith(request)
        expect(middleware2).not.toHaveBeenCalled()
        expect(result).toBe(response404)
      })

      it("should stop chain when x-middleware-next header is not '1'", async () => {
        const responseWithHeader = new NextResponse(null, {
          status: 200,
          headers: { "x-middleware-next": "0" },
        })
        const middleware1 = createMockMiddleware("first", responseWithHeader)
        const middleware2 = createMockMiddleware("second")
        const chainedMiddleware = chain(middleware1, middleware2)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware1).toHaveBeenCalledWith(request)
        expect(middleware2).not.toHaveBeenCalled()
        expect(result).toBe(responseWithHeader)
      })

      it("should continue chain when x-middleware-next header is '1'", async () => {
        const responseWithHeader = new NextResponse(null, {
          status: 200,
          headers: { "x-middleware-next": "1" },
        })
        const middleware1 = createMockMiddleware("first", responseWithHeader)
        const middleware2 = createMockMiddleware("second")
        const chainedMiddleware = chain(middleware1, middleware2)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware1).toHaveBeenCalledWith(request)
        expect(middleware2).toHaveBeenCalledWith(request)
        expect(result).toEqual(NextResponse.next())
      })
    })

    describe("edge cases", () => {
      it("should handle empty chain", async () => {
        const chainedMiddleware = chain()
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(result).toEqual(NextResponse.next())
      })

      it("should handle middleware that throws an error", async () => {
        const errorMiddleware = vi.fn().mockRejectedValue(new Error("Middleware error"))
        const middleware2 = createMockMiddleware("second")
        const chainedMiddleware = chain(errorMiddleware, middleware2)
        const request = createMockRequest()

        await expect(chainedMiddleware(request)).rejects.toThrow("Middleware error")
        expect(errorMiddleware).toHaveBeenCalledWith(request)
        expect(middleware2).not.toHaveBeenCalled()
      })

      it("should handle large number of middleware", async () => {
        const middlewares = Array.from({ length: 10 }, (_, i) =>
          createMockMiddleware(`middleware-${i}`)
        )
        const chainedMiddleware = chain(...middlewares)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        middlewares.forEach((middleware) => {
          expect(middleware).toHaveBeenCalledWith(request)
        })
        expect(result).toEqual(NextResponse.next())
      })

      it("should handle middleware with complex response objects", async () => {
        const complexResponse = NextResponse.json(
          { data: { user: "test", roles: ["admin"] } },
          {
            status: 200,
            headers: {
              "custom-header": "value",
              "x-middleware-next": "0",
            },
          }
        )
        const middleware1 = createMockMiddleware("first", complexResponse)
        const middleware2 = createMockMiddleware("second")
        const chainedMiddleware = chain(middleware1, middleware2)
        const request = createMockRequest()

        const result = await chainedMiddleware(request)

        expect(middleware1).toHaveBeenCalledWith(request)
        expect(middleware2).not.toHaveBeenCalled()
        expect(result).toBe(complexResponse)
      })
    })
  })

  describe("integration tests", () => {
    it("should work with conditional and chain together", async () => {
      const condition = vi.fn().mockReturnValue(true)
      const middleware1 = createMockMiddleware("first")
      const middleware2 = createMockMiddleware("second")

      const conditionalMiddleware = conditional(condition, middleware1)
      const chainedMiddleware = chain(conditionalMiddleware, middleware2)
      const request = createMockRequest()

      const result = await chainedMiddleware(request)

      expect(condition).toHaveBeenCalledWith(request)
      expect(middleware1).toHaveBeenCalledWith(request)
      expect(middleware2).toHaveBeenCalledWith(request)
      expect(result).toEqual(NextResponse.next())
    })

    it("should handle conditional that returns false in chain", async () => {
      const condition = vi.fn().mockReturnValue(false)
      const middleware1 = createMockMiddleware("first")
      const middleware2 = createMockMiddleware("second")

      const conditionalMiddleware = conditional(condition, middleware1)
      const chainedMiddleware = chain(conditionalMiddleware, middleware2)
      const request = createMockRequest()

      const result = await chainedMiddleware(request)

      expect(condition).toHaveBeenCalledWith(request)
      expect(middleware1).not.toHaveBeenCalled()
      expect(middleware2).toHaveBeenCalledWith(request)
      expect(result).toEqual(NextResponse.next())
    })

    it("should handle nested chains and conditionals", async () => {
      const condition1 = vi.fn().mockReturnValue(true)
      const condition2 = vi.fn().mockReturnValue(false)
      const middleware1 = createMockMiddleware("first")
      const middleware2 = createMockMiddleware("second")
      const middleware3 = createMockMiddleware("third")

      const conditional1 = conditional(condition1, middleware1)
      const conditional2 = conditional(condition2, middleware2)
      const chainedMiddleware = chain(conditional1, conditional2, middleware3)
      const request = createMockRequest()

      const result = await chainedMiddleware(request)

      expect(condition1).toHaveBeenCalledWith(request)
      expect(condition2).toHaveBeenCalledWith(request)
      expect(middleware1).toHaveBeenCalledWith(request)
      expect(middleware2).not.toHaveBeenCalled()
      expect(middleware3).toHaveBeenCalledWith(request)
      expect(result).toEqual(NextResponse.next())
    })
  })
})
