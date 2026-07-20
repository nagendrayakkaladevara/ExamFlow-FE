import { api } from '@/lib/api-client'
import type { LoginCredentials, LoginResponse, PublicUser, RefreshResponse } from '@/types/auth'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/auth/login', credentials, { skipAuth: true }),

  refresh: () =>
    api.post<RefreshResponse>('/auth/refresh', undefined, {
      skipAuth: true,
      skipRefresh: true,
    }),

  logout: () => api.post<{ message: string }>('/auth/logout', undefined, { skipRefresh: true }),

  me: () => api.get<PublicUser>('/auth/me'),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.post<void>('/auth/change-password', body),
}
