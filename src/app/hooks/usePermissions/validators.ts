/**
 * Validation Functions for Permission System
 *
 * These functions validate input parameters for the permission system
 * and throw ValidationError for invalid inputs.
 */

import { ValidationError } from "./errors"

/**
 * Validates that a role is a non-empty string
 */
export const validateRole = (role: unknown): void => {
  if (typeof role !== "string" || role.trim() === "") {
    throw new ValidationError(`Invalid role: ${role}. Must be a non-empty string`)
  }
}

/**
 * Validates that an action is a non-empty string
 */
export const validateAction = (action: unknown): void => {
  if (typeof action !== "string" || action.trim() === "") {
    throw new ValidationError(`Invalid action: ${action}. Must be a non-empty string`)
  }
}

/**
 * Validates that a resource is a non-empty string
 */
export const validateResource = (resource: unknown): void => {
  if (typeof resource !== "string" || resource.trim() === "") {
    throw new ValidationError(`Invalid resource: ${resource}. Must be a non-empty string`)
  }
}

/**
 * Validates that context is a non-null object (but not an array)
 */
export const validateContext = (context: unknown): void => {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    throw new ValidationError("Permission context must be a non-null object")
  }
}
