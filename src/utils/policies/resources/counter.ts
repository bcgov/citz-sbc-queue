import type { Policy } from "../types"

export const CounterPolicy: Policy = (user_context, data) => {
  const { role } = user_context
  const actions = new Set<string>()

  // All non-Authenticated users can view counters
  if (role !== "Authenticated") actions.add("view")

  // SDM and Administrator can create and edit counters
  if (role === "SDM" || role === "Administrator") {
    actions.add("create")
    if (data?.name !== "Counter") actions.add("edit") // Allow editing of any counter except the default "Counter"
  }

  // Only Administrators can delete counters, except the default "Counter" which is protected from deletion
  if (role === "Administrator" && data?.name !== "Counter") actions.add("delete")

  return Array.from(actions)
}
