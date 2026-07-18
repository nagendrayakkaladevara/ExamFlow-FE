import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store'
import type { LoginFormValues } from '@/features/auth/schemas'
import { getRoleHomePath, sanitizeReturnPath } from '@/lib/api-client'
import { isApiError } from '@/lib/errors'
import { queryKeys } from '@/config/query-keys'

export function useBootstrapAuth() {
  const setSession = useAuthStore((s) => s.setSession)
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped)
  const clearSession = useAuthStore((s) => s.clearSession)

  return useQuery({
    queryKey: queryKeys.auth.bootstrap,
    queryFn: async () => {
      try {
        const refresh = await authApi.refresh()
        const user = await authApi.me()
        setSession(refresh.accessToken, user)
        return user
      } catch {
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
      setSession(data.accessToken, data.user)
      const safeNext = sanitizeReturnPath(returnPath ?? null)
      navigate(safeNext ?? getRoleHomePath(data.user.role))
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
      clearSession()
      queryClient.clear()
      navigate('/login')
    },
  })
}
