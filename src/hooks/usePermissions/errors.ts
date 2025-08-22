/**
 * Custom Error Classes for Permission System
 *
 * These error classes provide specific error types for different failure scenarios
 * in the permission evaluation system, making error handling more precise.
 */

/**
 * Base error class for all permission-related errors
 */
export class PermissionError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message)
    this.name = "PermissionError"
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends PermissionError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR")
  }
}

/**
 * Error thrown when permission evaluation logic fails
 */
export class EvaluationError extends PermissionError {
  constructor(message: string) {
    super(message, "EVALUATION_ERROR")
  }
}
