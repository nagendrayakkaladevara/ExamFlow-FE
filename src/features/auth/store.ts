import { create } from 'zustand'
import type { PublicUser } from '@/types/auth'

interface AuthState {
  accessToken: string | null
  user: PublicUser | null
  isBootstrapped: boolean
  setSession: (accessToken: string, user: PublicUser) => void
  setAccessToken: (accessToken: string) => void
  setUser: (user: PublicUser) => void
  setBootstrapped: (value: boolean) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isBootstrapped: false,
  setSession: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setBootstrapped: (isBootstrapped) => set({ isBootstrapped }),
  clearSession: () => set({ accessToken: null, user: null }),
}))

export function selectIsAuthenticated(state: AuthState): boolean {
  return Boolean(state.accessToken && state.user)
}
