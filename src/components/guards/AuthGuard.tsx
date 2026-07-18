import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getRoleHomePath } from '@/lib/api-client'
import { selectIsAuthenticated, useAuthStore } from '@/features/auth/store'

export function GuestGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((s) => s.user)
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped)

  if (!isBootstrapped) {
    return null
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />
  }

  return <Outlet />
}

export function AuthGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped)
  const location = useLocation()

  if (!isBootstrapped) {
    return null
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <Outlet />
}
