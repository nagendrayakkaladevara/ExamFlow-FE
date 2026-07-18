import { env } from '@/lib/env'
import { getCsrfHeaders } from '@/lib/csrf'
import { ApiError } from '@/lib/errors'
import type { ApiResponse } from '@/types/api'
import { useAuthStore } from '@/features/auth/store'

const API_PREFIX = '/api/v1'
const DEFAULT_TIMEOUT_MS = 30_000

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  credentials?: RequestCredentials
  signal?: AbortSignal
  skipAuth?: boolean
  skipRefresh?: boolean
}

let refreshPromise: Promise<string | null> | null = null

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${env.VITE_API_BASE_URL}${API_PREFIX}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok || !payload.success) {
    if (!payload.success) {
      throw new ApiError(response.status, payload.error)
    }
    throw new ApiError(response.status, {
      code: 'UNKNOWN_ERROR',
      message: 'Request failed.',
    })
  }

  return payload
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await parseJsonResponse<T>(response)
  if (!payload.success) {
    throw new ApiError(response.status, {
      code: 'UNKNOWN_ERROR',
      message: 'Request failed.',
    })
  }
  return payload.data
}

export interface PaginatedResult<T> {
  data: T[]
  meta?: Record<string, unknown>
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(
          buildUrl('/auth/refresh'),
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...getCsrfHeaders(),
            },
          },
        )

        const data = await parseResponse<{ accessToken: string }>(response)
        useAuthStore.getState().setAccessToken(data.accessToken)
        return data.accessToken
      } catch {
        useAuthStore.getState().clearSession()
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  const signal = options.signal ?? controller.signal

  try {
    const { accessToken } = useAuthStore.getState()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    }

    if (!options.skipAuth && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: options.credentials ?? 'include',
      signal,
    })

    if (response.status === 401 && !options.skipAuth && !options.skipRefresh) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        return request<T>(method, path, { ...options, skipRefresh: true })
      }
      throw new ApiError(401, {
        code: 'UNAUTHORIZED',
        message: 'Session expired.',
      })
    }

    return parseResponse<T>(response)
  } finally {
    clearTimeout(timeoutId)
  }
}

async function requestPaginated<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<PaginatedResult<T>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  const signal = options.signal ?? controller.signal

  try {
    const { accessToken } = useAuthStore.getState()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    }

    if (!options.skipAuth && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: options.credentials ?? 'include',
      signal,
    })

    if (response.status === 401 && !options.skipAuth && !options.skipRefresh) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        return requestPaginated<T>(method, path, { ...options, skipRefresh: true })
      }
      throw new ApiError(401, {
        code: 'UNAUTHORIZED',
        message: 'Session expired.',
      })
    }

    const payload = await parseJsonResponse<T[]>(response)
    if (!payload.success) {
      throw new ApiError(response.status, {
        code: 'UNKNOWN_ERROR',
        message: 'Request failed.',
      })
    }
    return { data: payload.data, meta: payload.meta }
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),
  getList: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    requestPaginated<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', path, options),
}

export function getRoleHomePath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'LECTURER':
      return '/lecturer'
    case 'STUDENT':
      return '/student'
    default:
      return '/login'
  }
}

export function sanitizeReturnPath(next: string | null): string | null {
  if (!next) return null
  if (!next.startsWith('/') || next.startsWith('//')) return null
  if (next.includes('://') || next.toLowerCase().startsWith('javascript:')) {
    return null
  }
  return next
}
