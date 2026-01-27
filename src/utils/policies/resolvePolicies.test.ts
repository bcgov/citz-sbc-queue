import { beforeEach, describe, expect, it, vi } from "vitest"
import { policies } from "./policies"
import { resolvePolicies } from "./resolvePolicies"

import type { UserContext } from "./types"

describe("resolvePolicies", () => {
  beforeEach(() => {
    Object.keys(policies).forEach((k) => delete (policies as Record<string, unknown>)[k])
    vi.restoreAllMocks()
  })

  it("returns empty actions when no policies are registered", () => {
    const user: UserContext = { staff_user_id: null, role: null }
    const requests = [{ resource: "missing", data: null }]

    const result = resolvePolicies(requests, user)

    expect(result).toEqual([{ resource: "missing", actions: [] }])
  })

  it("returns actions for multiple resources", () => {
    policies.a = () => ["get"]
    policies.b = () => ["get", "update"]

    const user: UserContext = { staff_user_id: "u1", role: null }
    const requests = [
      { resource: "a", data: null },
      { resource: "b", data: null },
    ]

    const result = resolvePolicies(requests, user)

    expect(result).toEqual([
      { resource: "a", actions: ["get"] },
      { resource: "b", actions: ["get", "update"] },
    ])
  })
})
