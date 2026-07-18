import { Navigate } from 'react-router-dom'
import { getRoleHomePath } from '@/lib/api-client'
import { selectIsAuthenticated, useAuthStore } from '@/features/auth/store'
import { FullPageSpinner } from '@/components/feedback/FullPageSpinner'

export function RootRedirect() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((s) => s.user)
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped)

  if (!isBootstrapped) {
    return <FullPageSpinner />
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />
  }

  return <Navigate to="/login" replace />
}
