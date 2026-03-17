import type { Policy } from "../types"

export const LocationPolicy: Policy = (user_context, data) => {
  const { role, location_code } = user_context
  const actions = new Set<string>()

  // View permissions
  if (data?.code === location_code) actions.add("view") // Users can view records in their own location
  if (role === "Administrator") actions.add("view") // Administrators can view all records

  // Create permissions
  if (role === "Administrator") actions.add("create") // Administrators can create locations

  // Edit permissions
  if (data?.code === location_code && role === "SDM") actions.add("edit") // SDM users can edit records in their own location
  if (role === "Administrator") actions.add("edit") // Administrators can edit all records

  // Archive permissions
  if (role === "Administrator") actions.add("archive") // Administrators can archive all records

  return Array.from(actions)
}
