export interface ApiSuccessResponse<T, M = Record<string, unknown>> {
  success: true
  data: T
  meta?: M
  requestId?: string
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: ApiErrorBody
  requestId?: string
}

export type ApiResponse<T, M = Record<string, unknown>> =
  | ApiSuccessResponse<T, M>
  | ApiErrorResponse

export interface CursorPaginationMeta {
  nextCursor: string | null
}
