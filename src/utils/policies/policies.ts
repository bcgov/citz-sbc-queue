import { LocationPolicy } from "./resources/location"
import { ServicePolicy } from "./resources/service"
import { ServiceCategoryPolicy } from "./resources/service_category"
import { StaffUserPolicy } from "./resources/staff_user"
import type { Policies } from "./types"

/**
 * Resource policies map.
 *
 * Each key represents a protected resource (e.g. "comment", "location").
 * The value is a policy function that determines which actions are allowed
 * for a given user and resource record.
 *
 * Policies:
 * - Must be pure evaluation functions (no database access)
 * - Receive the current user context and optional resource data
 * - Return a list of allowed action strings
 *
 * Actions are not limited to CRUD and may represent any domain-specific capability
 * such as "moderate", "publish", "lock", or "approve".
 */
export const policies: Policies = {
  staff_user: StaffUserPolicy,
  location: LocationPolicy,
  service: ServicePolicy,
  service_category: ServiceCategoryPolicy,
}
