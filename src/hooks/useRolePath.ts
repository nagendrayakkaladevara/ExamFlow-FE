import { useAuthStore } from '@/features/auth/store'
import { getRoleBasePath } from '@/config/navigation'

export function useRoleBasePath() {
  const role = useAuthStore((s) => s.user?.role)
  return role ? getRoleBasePath(role) : '/'
}

export function useRolePrefix() {
  return useRoleBasePath()
}
