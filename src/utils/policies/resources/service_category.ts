import type { Policy } from "../types"

export const ServiceCategoryPolicy: Policy = (user_context, _data) => {
  const { role } = user_context
  const actions = new Set<string>()

  // View permissions
  actions.add("view") // Anyone can view service categories

  // Create permissions
  if (role === "Administrator") actions.add("create") // Administrators can create service categories

  // Edit permissions
  if (role === "Administrator") actions.add("edit") // Administrators can edit all records

  // Archive permissions
  if (role === "Administrator") actions.add("archive") // Administrators can archive all records

  return Array.from(actions)
}
