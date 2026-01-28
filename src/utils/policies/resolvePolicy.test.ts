import { beforeEach, describe, expect, it, vi } from "vitest"
import { policies } from "./policies"
import { resolvePolicy } from "./resolvePolicy"

import type { ResourceData, UserContext } from "./types"

describe("resolvePolicy", () => {
  beforeEach(() => {
    // Reset policies map between tests
    Object.keys(policies).forEach((k) => delete (policies as Record<string, unknown>)[k])
    vi.restoreAllMocks()
  })

  it("returns empty array and logs when no policy is registered", () => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: <>
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {})

    const result = resolvePolicy("nonexistent", { staff_user_id: null, role: null })

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it("returns actions provided by a resource policy", () => {
    policies.testResource = (_user: UserContext, _data: ResourceData) => ["get", "create"]

    const result = resolvePolicy("testResource", { staff_user_id: "u1", role: null })

    expect(result).toEqual(["get", "create"])
  })

  it("honors user context and resource data inside policy", () => {
    policies.ownedResource = (user: UserContext, data: ResourceData) => {
      const actions: string[] = ["get"]
      if (user.staff_user_id && data?.created_by === user.staff_user_id) actions.push("update")
      return actions
    }

    const user: UserContext = { staff_user_id: "owner-1", role: null }
    const ownerData: ResourceData = { created_by: "owner-1" }
    const notOwnerData: ResourceData = { created_by: "someone-else" }

    expect(resolvePolicy("ownedResource", user, ownerData)).toEqual(["get", "update"])
    expect(resolvePolicy("ownedResource", user, notOwnerData)).toEqual(["get"])
  })
})
