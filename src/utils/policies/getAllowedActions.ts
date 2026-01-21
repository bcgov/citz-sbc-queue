import { policies } from "./policies"
import type { ResourceData, UserContext } from "./types"

/**
 * Returns the list of allowed actions for a specific resource.
 *
 * This function evaluates the resource's policy using the provided user context
 * and resource data. If no policy is registered for the resource, an empty
 * array is returned.
 *
 * @param resource - The name of the resource being accessed
 * @param user_context - Information about the acting user
 * @param data - The resource record (if applicable)
 * @returns An array of allowed action strings for the resource
 */
export const getAllowedActions = (
  resource: string,
  user_context: UserContext,
  data: ResourceData = null
): string[] => {
  const policy = policies[resource]

  if (!policy) {
    console.info(`No policy found for resource: ${resource}`)
    return []
  }

  return policy(user_context, data)
}
