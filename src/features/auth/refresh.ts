import { env } from '@/lib/env'
import { getCsrfHeaders } from '@/lib/csrf'
import { ApiError } from '@/lib/errors'
import type { ApiResponse } from '@/types/api'
import type { RefreshResponse } from '@/types/auth'
import { useAuthStore } from '@/features/auth/store'
import {
  cancelProactiveRefresh,
  scheduleProactiveRefresh,
} from '@/features/auth/token'

const API_PREFIX = '/api/v1'

let refreshPromise: Promise<string | null> | null = null
let onSessionExpired: (() => void) | null = null

function buildRefreshUrl(): string {
  return `${env.VITE_API_BASE_URL}${API_PREFIX}/auth/refresh`
}

export function registerSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

function notifySessionExpired(): void {
  onSessionExpired?.()
}

function applyRefreshedToken(accessToken: string, expiresIn: string): void {
  useAuthStore.getState().setAccessToken(accessToken, expiresIn)
  scheduleProactiveRefresh(expiresIn, async () => {
    try {
      await refreshAccessToken()
    } catch {
      notifySessionExpired()
    }
  })
}

async function parseRefreshResponse(response: Response): Promise<RefreshResponse> {
  const payload = (await response.json()) as ApiResponse<RefreshResponse>

  if (!response.ok || !payload.success) {
    if (!payload.success) {
      throw new ApiError(response.status, payload.error)
    }
    throw new ApiError(response.status, {
      code: 'UNAUTHORIZED',
      message: 'Session expired.',
    })
  }

  return payload.data
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(buildRefreshUrl(), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...getCsrfHeaders(),
          },
        })

        const data = await parseRefreshResponse(response)
        applyRefreshedToken(data.accessToken, data.expiresIn)
        return data.accessToken
      } catch {
        cancelProactiveRefresh()
        useAuthStore.getState().clearSession()
        notifySessionExpired()
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

export function startTokenLifecycle(expiresIn: string): void {
  scheduleProactiveRefresh(expiresIn, async () => {
    try {
      await refreshAccessToken()
    } catch {
      notifySessionExpired()
    }
  })
}

export function stopTokenLifecycle(): void {
  cancelProactiveRefresh()
}
