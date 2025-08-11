import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Chain multiple middleware functions together
 */
export function chain(
  ...middlewares: ((request: NextRequest) => Promise<NextResponse> | NextResponse)[]
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    for (const middleware of middlewares) {
      const result = await middleware(request)

      // If any middleware returns a response other than NextResponse.next(),
      // stop the chain and return that response
      if (result.status !== 200 || result.headers.get("x-middleware-next") !== "1") {
        return result
      }
    }

    return NextResponse.next()
  }
}

/**
 * Create a conditional middleware that only runs if the condition is met
 */
export function conditional(
  condition: (request: NextRequest) => boolean,
  middleware: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (condition(request)) {
      return middleware(request)
    }
    return NextResponse.next()
  }
}
