import type { Policy } from "../types"

export const LocationPolicy: Policy = (user_context, data) => {
  const { role, location_code } = user_context
  const actions = new Set<string>()

  // Users can view records in their own location (except Authenticated role), administrators can view all records
  if ((role !== "Authenticated" && data?.code === location_code) || role === "Administrator")
    actions.add("view")

  // Administrators can create locations
  if (role === "Administrator") actions.add("create")

  // SDM users can edit records in their own location, administrators can edit all records
  if ((data?.code === location_code && role === "SDM") || role === "Administrator")
    actions.add("edit")

  // Administrators can archive all records
  if (role === "Administrator") actions.add("archive")

  return Array.from(actions)
}
