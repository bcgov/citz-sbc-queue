/**
 * Tests for permission system validation functions
 */

import { describe, expect, it } from "vitest"
import { ValidationError } from "./errors"
import { validateAction, validateContext, validateResource, validateRole } from "./validators"

describe("Permission Validators", () => {
  describe("validateRole", () => {
    it("should pass for valid string roles", () => {
      expect(() => validateRole("admin")).not.toThrow()
      expect(() => validateRole("user")).not.toThrow()
      expect(() => validateRole("guest")).not.toThrow()
    })

    it("should throw ValidationError for invalid roles", () => {
      expect(() => validateRole("")).toThrow(ValidationError)
      expect(() => validateRole("   ")).toThrow(ValidationError)
      expect(() => validateRole(null)).toThrow(ValidationError)
      expect(() => validateRole(undefined)).toThrow(ValidationError)
      expect(() => validateRole(123)).toThrow(ValidationError)
      expect(() => validateRole({})).toThrow(ValidationError)
    })
  })

  describe("validateAction", () => {
    it("should pass for valid string actions", () => {
      expect(() => validateAction("read")).not.toThrow()
      expect(() => validateAction("write")).not.toThrow()
      expect(() => validateAction("delete")).not.toThrow()
    })

    it("should throw ValidationError for invalid actions", () => {
      expect(() => validateAction("")).toThrow(ValidationError)
      expect(() => validateAction("   ")).toThrow(ValidationError)
      expect(() => validateAction(null)).toThrow(ValidationError)
      expect(() => validateAction(undefined)).toThrow(ValidationError)
      expect(() => validateAction(123)).toThrow(ValidationError)
    })
  })

  describe("validateResource", () => {
    it("should pass for valid string resources", () => {
      expect(() => validateResource("appointment")).not.toThrow()
      expect(() => validateResource("user")).not.toThrow()
      expect(() => validateResource("document")).not.toThrow()
    })

    it("should throw ValidationError for invalid resources", () => {
      expect(() => validateResource("")).toThrow(ValidationError)
      expect(() => validateResource("   ")).toThrow(ValidationError)
      expect(() => validateResource(null)).toThrow(ValidationError)
      expect(() => validateResource(undefined)).toThrow(ValidationError)
      expect(() => validateResource([])).toThrow(ValidationError)
    })
  })

  describe("validateContext", () => {
    it("should pass for valid context objects", () => {
      expect(() => validateContext({})).not.toThrow()
      expect(() => validateContext({ userId: "123" })).not.toThrow()
      expect(() => validateContext({ data: { key: "value" } })).not.toThrow()
    })

    it("should throw ValidationError for invalid contexts", () => {
      expect(() => validateContext(null)).toThrow(ValidationError)
      expect(() => validateContext(undefined)).toThrow(ValidationError)
      expect(() => validateContext("string")).toThrow(ValidationError)
      expect(() => validateContext(123)).toThrow(ValidationError)
      expect(() => validateContext([])).toThrow(ValidationError)
    })
  })
})
