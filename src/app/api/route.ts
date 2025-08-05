import { NextResponse } from "next/server"

/**
 * Health check endpoint for monitoring and load balancer health checks
 * Returns application status, timestamp, and basic system information
 */

interface HealthCheckResponse {
  status: "healthy" | "unhealthy"
  timestamp: string
  uptime: number
  environment: string
  version: string
  checks: {
    server: "pass" | "fail"
    database?: "pass" | "fail"
    memory: "pass" | "fail"
  }
}

/**
 * GET /api/health
 * Returns the health status of the application
 */
export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  try {
    const startTime = Date.now()

    // Basic server check
    const serverCheck: "pass" | "fail" = "pass"

    // Memory usage check (basic threshold check)
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024
    const memoryThresholdMB = 500 // 500MB threshold
    const memoryCheck: "pass" | "fail" = memoryUsageMB < memoryThresholdMB ? "pass" : "fail" // TODO: Add database connectivity check when database is implemented
    // const databaseCheck = await checkDatabaseConnection();

    const checks = {
      server: serverCheck,
      // database: databaseCheck,
      memory: memoryCheck,
    }

    // Determine overall health status
    const allChecksPass = Object.values(checks).every((check) => check === "pass")
    const status = allChecksPass ? "healthy" : "unhealthy"

    const healthResponse: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      checks,
    }

    const statusCode = status === "healthy" ? 200 : 503
    const processingTime = Date.now() - startTime

    return NextResponse.json(healthResponse, {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Response-Time": `${processingTime}ms`,
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)

    const errorResponse: HealthCheckResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      checks: {
        server: "fail",
        memory: "fail",
      },
    }

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  }
}

/**
 * HEAD /api/health
 * Lightweight health check for load balancers that only need status codes
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    // Perform minimal checks for HEAD requests
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024
    const memoryThresholdMB = 500

    const isHealthy = memoryUsageMB < memoryThresholdMB
    const statusCode = isHealthy ? 200 : 503

    return new NextResponse(null, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Health check HEAD failed:", error)
    return new NextResponse(null, { status: 503 })
  }
}
