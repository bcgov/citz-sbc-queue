import type { Policy } from "../types"

export const ServicePolicy: Policy = (user_context, _data) => {
  const { role } = user_context
  const actions = new Set<string>()

  // View permissions
  actions.add("view") // Anyone can view services

  // Admin can create, edit and archive
  if (role === "Administrator") {
    actions.add("create") // Administrators can create services
    actions.add("edit") // Administrators can edit all records
    actions.add("archive") // Administrators can archive all records
  }

  return Array.from(actions)
}
