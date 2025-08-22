/**
 * Tests for permission system helper functions
 */

import { describe, expect, it } from "vitest"
import {
  createAllPermissionChecker,
  createAnyPermissionChecker,
  createPermissionChecker,
  createResourcePermissionGetter,
  extractAllActions,
} from "./helpers"
import type { PermissionResult, PermissionRule } from "./types"

describe("Permission Helpers", () => {
  const mockRules: readonly PermissionRule[] = [
    { role: "admin", resource: "appointment", actions: ["view", "create", "update", "delete"] },
    { role: "staff", resource: "appointment", actions: ["view", "update"] },
    { role: "admin", resource: "queue", actions: ["view", "create", "update", "delete"] },
    { role: "manager", resource: "queue", actions: ["view", "update"] },
  ] as const

  const mockResults: PermissionResult[] = [
    { resource: "appointment", action: "view", hasPermission: true },
    { resource: "appointment", action: "create", hasPermission: true },
    { resource: "appointment", action: "update", hasPermission: false },
    { resource: "appointment", action: "delete", hasPermission: false },
    { resource: "queue", action: "view", hasPermission: true },
    { resource: "queue", action: "create", hasPermission: false },
  ]

  describe("extractAllActions", () => {
    it("should extract unique actions from rules", () => {
      const actions = extractAllActions(mockRules)

      expect(actions).toContain("view")
      expect(actions).toContain("create")
      expect(actions).toContain("update")
      expect(actions).toContain("delete")

      // Should not have duplicates
      const uniqueActions = Array.from(new Set(actions))
      expect(actions.length).toBe(uniqueActions.length)
    })

    it("should return empty array for empty rules", () => {
      const actions = extractAllActions([])
      expect(actions).toEqual([])
    })
  })

  describe("createPermissionChecker", () => {
    it("should create function that checks permissions correctly", () => {
      const hasPermission = createPermissionChecker(mockResults)

      expect(hasPermission("appointment", "view")).toBe(true)
      expect(hasPermission("appointment", "create")).toBe(true)
      expect(hasPermission("appointment", "update")).toBe(false)
      expect(hasPermission("appointment", "delete")).toBe(false)
      expect(hasPermission("queue", "view")).toBe(true)
      expect(hasPermission("queue", "create")).toBe(false)

      // Non-existent permission should return false
      expect(hasPermission("nonexistent", "action")).toBe(false)
    })
  })

  describe("createResourcePermissionGetter", () => {
    it("should create function that filters by resource", () => {
      const getResourcePermissions = createResourcePermissionGetter(mockResults)

      const appointmentPermissions = getResourcePermissions("appointment")
      expect(appointmentPermissions).toHaveLength(4)
      expect(appointmentPermissions.every((p) => p.resource === "appointment")).toBe(true)

      const queuePermissions = getResourcePermissions("queue")
      expect(queuePermissions).toHaveLength(2)
      expect(queuePermissions.every((p) => p.resource === "queue")).toBe(true)

      const nonexistentPermissions = getResourcePermissions("nonexistent")
      expect(nonexistentPermissions).toHaveLength(0)
    })
  })

  describe("createAnyPermissionChecker", () => {
    it("should create function that checks if any permissions match", () => {
      const hasPermission = createPermissionChecker(mockResults)
      const hasAnyPermission = createAnyPermissionChecker(hasPermission)

      // Should return true if any action is permitted
      expect(hasAnyPermission("appointment", ["view", "update"])).toBe(true) // view is true
      expect(hasAnyPermission("appointment", ["update", "delete"])).toBe(false) // both false
      expect(hasAnyPermission("queue", ["view", "create"])).toBe(true) // view is true

      // Empty actions array should return false
      expect(hasAnyPermission("appointment", [])).toBe(false)
    })
  })

  describe("createAllPermissionChecker", () => {
    it("should create function that checks if all permissions match", () => {
      const hasPermission = createPermissionChecker(mockResults)
      const hasAllPermissions = createAllPermissionChecker(hasPermission)

      // Should return true only if all actions are permitted
      expect(hasAllPermissions("appointment", ["view", "create"])).toBe(true) // both true
      expect(hasAllPermissions("appointment", ["view", "update"])).toBe(false) // update is false
      expect(hasAllPermissions("appointment", ["update", "delete"])).toBe(false) // both false

      // Empty actions array should return true (vacuous truth)
      expect(hasAllPermissions("appointment", [])).toBe(true)
    })
  })
})
