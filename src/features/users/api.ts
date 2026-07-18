import { api } from '@/lib/api-client'
import type { PublicUser } from '@/types/auth'
import type { UserRole } from '@/types/enums'

export interface ListUsersParams {
  role?: UserRole
  isActive?: boolean
  limit?: number
  cursor?: string
}

export interface CreateUserInput {
  email: string
  password: string
  role: Extract<UserRole, 'LECTURER' | 'STUDENT'>
  firstName: string
  lastName: string
}

export interface UpdateUserInput {
  email?: string
  firstName?: string
  lastName?: string
  isActive?: boolean
  password?: string
}

export const usersApi = {
  list: (params?: ListUsersParams) =>
    api.getList<PublicUser>('/users', {
      params: params as Record<string, string | number | boolean | null | undefined>,
    }),

  get: (id: string) => api.get<PublicUser>(`/users/${id}`),

  create: (body: CreateUserInput) => api.post<PublicUser>('/users', body),

  update: (id: string, body: UpdateUserInput) =>
    api.patch<PublicUser>(`/users/${id}`, body),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/users/${id}`),

  resetPassword: (userId: string, newPassword: string) =>
    api.post<void>('/auth/reset-password', { userId, newPassword }),
}
