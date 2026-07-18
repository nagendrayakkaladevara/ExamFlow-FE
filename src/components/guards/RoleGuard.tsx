import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '@/types/enums'
import { useAuthStore } from '@/features/auth/store'

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return null
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
