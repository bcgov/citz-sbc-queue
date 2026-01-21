import { getAllowedActions } from "./getAllowedActions"
import type { PolicyRequest, UserContext } from "./types"

/**
 * Evaluates policies for multiple resources in a single call.
 *
 * Each request is checked independently using its associated resource policy.
 * The result includes every requested resource along with the actions the user
 * is allowed to perform on it.
 *
 * @param requests - A list of resource policy requests
 * @param user_context - Information about the acting user
 * @returns An array of resources paired with their allowed actions
 */
export const resolvePolicies = (
  requests: PolicyRequest[],
  user_context: UserContext
): Array<{ resource: string; actions: string[] }> => {
  return requests.map(({ resource, data = null }) => {
    return {
      resource,
      actions: getAllowedActions(resource, user_context, data),
    }
  })
}
