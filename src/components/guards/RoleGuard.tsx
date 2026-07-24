import { Outlet } from 'react-router-dom'
import type { UserRole } from '@/types/enums'
import { useAuthStore } from '@/features/auth/store'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return null
  }

  if (!allowedRoles.includes(user.role)) {
    return <NotFoundPage />
  }

  return <Outlet />
}
