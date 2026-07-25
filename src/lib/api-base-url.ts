import { env } from '@/lib/env'

const API_PREFIX = '/api/v1'

/** Resolve the API origin. Empty env uses the current page origin (same-origin proxy). */
export function getApiBaseUrl(): string {
  if (env.VITE_API_BASE_URL) {
    return env.VITE_API_BASE_URL.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://localhost:5173'
}

export function buildApiUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const normalizedPath = path.startsWith(API_PREFIX) ? path : `${API_PREFIX}${path}`
  const url = new URL(normalizedPath, `${getApiBaseUrl()}/`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}
