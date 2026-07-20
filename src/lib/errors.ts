import type { ApiErrorBody } from '@/types/api'

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account temporarily locked. Try again later.',
  INVALID_REFRESH_TOKEN: 'Session expired. Please sign in again.',
  REFRESH_TOKEN_EXPIRED: 'Session expired. Please sign in again.',
  REFRESH_TOKEN_REUSE: 'Session invalidated for security. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  CORS_DENIED: 'Unable to connect from this origin.',
  NOT_FOUND: 'The requested resource was not found.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  ALREADY_SUBMITTED: 'This assignment has already been submitted.',
  ALREADY_VOTED: 'You have already voted in this poll.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait and try again.',
  ASSIGNMENT_NOT_STARTED: 'This assignment is not open yet.',
  ASSIGNMENT_CLOSED: 'This assignment is no longer available.',
  DEADLINE_PASSED: 'The time limit for this assignment has passed.',
  RESULTS_NOT_AVAILABLE: 'Results are not available yet.',
  IN_PROGRESS: 'Complete your attempt before viewing results.',
  INVALID_QUESTION: 'Invalid question data.',
  INVALID_TAGS: 'One or more selected tags are invalid.',
  INVALID_AUDIENCE: 'Invalid audience selection.',
  CLASS_ACCESS_DENIED: 'You do not have access to this class.',
  ADMIN_PROTECTED: 'This action is not allowed.',
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(status: number, error: ApiErrorBody) {
    super(getSafeErrorMessage(error))
    this.name = 'ApiError'
    this.code = error.code
    this.status = status
    this.details = error.details
  }
}

export function getSafeErrorMessage(error: ApiErrorBody): string {
  return ERROR_MESSAGES[error.code] ?? error.message ?? 'Something went wrong.'
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}
