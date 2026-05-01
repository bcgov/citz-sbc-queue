import type { Policy } from "../types"

export const CounterPolicy: Policy = (user_context, _data) => {
  const { role } = user_context
  const actions = new Set<string>()

  // All non-Authenticated users can view counters
  if (role !== "Authenticated") actions.add("view")

  // SDM and Administrator can create and edit counters
  if (role === "SDM" || role === "Administrator") {
    actions.add("create")
    actions.add("edit")
  }

  // Only Administrators can delete counters
  if (role === "Administrator") actions.add("delete")

  return Array.from(actions)
}
