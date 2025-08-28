/**
 * Tests for permission system error classes
 */

import { describe, expect, it } from "vitest"
import { EvaluationError, PermissionError, ValidationError } from "./errors"

describe("Permission Error Classes", () => {
  describe("PermissionError", () => {
    it("should create error with message and code", () => {
      const error = new PermissionError("Test message", "TEST_CODE")

      expect(error.message).toBe("Test message")
      expect(error.code).toBe("TEST_CODE")
      expect(error.name).toBe("PermissionError")
      expect(error instanceof Error).toBe(true)
    })
  })

  describe("ValidationError", () => {
    it("should create validation error with correct code", () => {
      const error = new ValidationError("Invalid input")

      expect(error.message).toBe("Invalid input")
      expect(error.code).toBe("VALIDATION_ERROR")
      expect(error.name).toBe("PermissionError")
      expect(error instanceof PermissionError).toBe(true)
    })
  })

  describe("EvaluationError", () => {
    it("should create evaluation error with correct code", () => {
      const error = new EvaluationError("Evaluation failed")

      expect(error.message).toBe("Evaluation failed")
      expect(error.code).toBe("EVALUATION_ERROR")
      expect(error.name).toBe("PermissionError")
      expect(error instanceof PermissionError).toBe(true)
    })
  })
})
