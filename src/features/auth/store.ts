import { create } from 'zustand'
import type { PublicUser } from '@/types/auth'
import { getTokenExpiresAt, cancelProactiveRefresh } from '@/features/auth/token'

interface AuthState {
  accessToken: string | null
  user: PublicUser | null
  tokenExpiresAt: number | null
  isBootstrapped: boolean
  setSession: (accessToken: string, user: PublicUser, expiresIn?: string) => void
  setAccessToken: (accessToken: string, expiresIn?: string) => void
  setUser: (user: PublicUser) => void
  setBootstrapped: (value: boolean) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  tokenExpiresAt: null,
  isBootstrapped: false,
  setSession: (accessToken, user, expiresIn) =>
    set({
      accessToken,
      user,
      tokenExpiresAt: expiresIn ? getTokenExpiresAt(expiresIn) : null,
    }),
  setAccessToken: (accessToken, expiresIn) =>
    set({
      accessToken,
      tokenExpiresAt: expiresIn ? getTokenExpiresAt(expiresIn) : null,
    }),
  setUser: (user) => set({ user }),
  setBootstrapped: (isBootstrapped) => set({ isBootstrapped }),
  clearSession: () => {
    cancelProactiveRefresh()
    set({ accessToken: null, user: null, tokenExpiresAt: null })
  },
}))

export function selectIsAuthenticated(state: AuthState): boolean {
  return Boolean(state.accessToken && state.user)
}
