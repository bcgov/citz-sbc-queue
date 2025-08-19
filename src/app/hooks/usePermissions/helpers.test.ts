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
    { role: "admin", resource: "user", actions: ["view", "create", "update", "delete"] },
    { role: "user", resource: "user", actions: ["view", "update"] },
    { role: "admin", resource: "post", actions: ["view", "create", "update", "delete", "publish"] },
    { role: "editor", resource: "post", actions: ["view", "update", "publish"] },
  ] as const

  const mockResults: PermissionResult<typeof mockRules>[] = [
    { resource: "user", action: "view", hasPermission: true },
    { resource: "user", action: "create", hasPermission: true },
    { resource: "user", action: "update", hasPermission: false },
    { resource: "user", action: "delete", hasPermission: false },
    { resource: "post", action: "view", hasPermission: true },
    { resource: "post", action: "create", hasPermission: false },
  ]

  describe("extractAllActions", () => {
    it("should extract unique actions from rules", () => {
      const actions = extractAllActions(mockRules)

      expect(actions).toContain("view")
      expect(actions).toContain("create")
      expect(actions).toContain("update")
      expect(actions).toContain("delete")
      expect(actions).toContain("publish")

      // Should not have duplicates
      const uniqueActions = [...new Set(actions)]
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

      expect(hasPermission("user", "view")).toBe(true)
      expect(hasPermission("user", "create")).toBe(true)
      expect(hasPermission("user", "update")).toBe(false)
      expect(hasPermission("user", "delete")).toBe(false)
      expect(hasPermission("post", "view")).toBe(true)
      expect(hasPermission("post", "create")).toBe(false)

      // Non-existent permission should return false
      expect(hasPermission("nonexistent", "action")).toBe(false)
    })
  })

  describe("createResourcePermissionGetter", () => {
    it("should create function that filters by resource", () => {
      const getResourcePermissions = createResourcePermissionGetter(mockResults)

      const userPermissions = getResourcePermissions("user")
      expect(userPermissions).toHaveLength(4)
      expect(userPermissions.every((p) => p.resource === "user")).toBe(true)

      const postPermissions = getResourcePermissions("post")
      expect(postPermissions).toHaveLength(2)
      expect(postPermissions.every((p) => p.resource === "post")).toBe(true)

      const nonexistentPermissions = getResourcePermissions("nonexistent")
      expect(nonexistentPermissions).toHaveLength(0)
    })
  })

  describe("createAnyPermissionChecker", () => {
    it("should create function that checks if any permissions match", () => {
      const hasPermission = createPermissionChecker(mockResults)
      const hasAnyPermission = createAnyPermissionChecker(hasPermission)

      // Should return true if any action is permitted
      expect(hasAnyPermission("user", ["view", "update"])).toBe(true) // view is true
      expect(hasAnyPermission("user", ["update", "delete"])).toBe(false) // both false
      expect(hasAnyPermission("post", ["view", "create"])).toBe(true) // view is true

      // Empty actions array should return false
      expect(hasAnyPermission("user", [])).toBe(false)
    })
  })

  describe("createAllPermissionChecker", () => {
    it("should create function that checks if all permissions match", () => {
      const hasPermission = createPermissionChecker(mockResults)
      const hasAllPermissions = createAllPermissionChecker(hasPermission)

      // Should return true only if all actions are permitted
      expect(hasAllPermissions("user", ["view", "create"])).toBe(true) // both true
      expect(hasAllPermissions("user", ["view", "update"])).toBe(false) // update is false
      expect(hasAllPermissions("user", ["update", "delete"])).toBe(false) // both false

      // Empty actions array should return true (vacuous truth)
      expect(hasAllPermissions("user", [])).toBe(true)
    })
  })
})
