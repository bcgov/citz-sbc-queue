import { createServer } from "node:http"
import request from "supertest"
import { describe, expect, it } from "vitest"
import { GET } from "./route"

// Create a test server that wraps the Next.js API route
const createTestServer = () => {
  return createServer(async (_req, res) => {
    const response = await GET()

    res.statusCode = response.status

    // Set headers from the Next.js Response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    const body = await response.text()
    res.end(body)
  })
}

describe("/api/auth", () => {
  describe("GET", () => {
    it("should return authentication API information", async () => {
      const server = createTestServer()

      const response = await request(server).get("/").expect(200).expect("Content-Type", /json/)

      expect(response.body).toEqual({
        message: "Authentication API - Please use one of the following endpoints:",
        endpoints: [
          "/api/auth/login - Login endpoint",
          "/api/auth/logout - Logout endpoint",
          "/api/auth/token - Token endpoint",
        ],
      })

      server.close()
    })

    it("should have correct response structure", async () => {
      const server = createTestServer()

      const response = await request(server).get("/").expect(200)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("endpoints")
      expect(Array.isArray(response.body.endpoints)).toBe(true)
      expect(response.body.endpoints).toHaveLength(3)

      server.close()
    })
  })
})
