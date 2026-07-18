import type { UserRole } from '@/types/enums'

export interface PublicUser {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  accessToken: string
  user: PublicUser
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: PublicUser
}

export interface RefreshResponse {
  accessToken: string
}
