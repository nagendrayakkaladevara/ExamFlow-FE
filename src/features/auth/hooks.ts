import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api'
import {
  refreshAccessToken,
  registerSessionExpiredHandler,
  startTokenLifecycle,
  stopTokenLifecycle,
} from '@/features/auth/refresh'
import { useAuthStore } from '@/features/auth/store'
import type { ChangePasswordFormValues, LoginFormValues } from '@/features/auth/schemas'
import type { PublicUser } from '@/types/auth'
import { resolvePostLoginPath } from '@/lib/api-client'
import { isApiError } from '@/lib/errors'
import { queryKeys } from '@/config/query-keys'

async function fetchCurrentUserWithRetry(): Promise<PublicUser> {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await authApi.me({ skipRefresh: true })
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        throw error
      }
      if (attempt === maxAttempts) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt))
    }
  }

  throw new Error('Failed to load user profile during auth bootstrap.')
}

export function useSessionExpiryHandler() {
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      if (window.location.pathname === '/login') return

      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
      window.location.assign(`/login?next=${next}`)
    })
  }, [])
}

export function useBootstrapAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped)
  const clearSession = useAuthStore((s) => s.clearSession)

  return useQuery({
    queryKey: queryKeys.auth.bootstrap,
    queryFn: async () => {
      try {
        const accessToken = await refreshAccessToken({ notifyOnFailure: false })
        if (!accessToken) {
          stopTokenLifecycle()
          clearSession()
          return null
        }

        const user = await fetchCurrentUserWithRetry()
        setUser(user)
        return user
      } catch {
        stopTokenLifecycle()
        clearSession()
        return null
      } finally {
        setBootstrapped(true)
      }
    },
    staleTime: Infinity,
    retry: false,
  })
}

export function useLoginMutation(returnPath?: string | null) {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user, data.expiresIn)
      startTokenLifecycle(data.expiresIn)
      navigate(resolvePostLoginPath(returnPath, data.user.role))
      toast.success('Welcome back!')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to sign in.')
    },
  })
}

export function useLogoutMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.clearSession)

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      stopTokenLifecycle()
      clearSession()
      queryClient.clear()
      navigate('/login')
    },
  })
}

export function useChangePasswordMutation() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((s) => s.clearSession)

  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      stopTokenLifecycle()
      clearSession()
      toast.success('Password updated. Please sign in again.')
      navigate('/login')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to change password.')
    },
  })
}
