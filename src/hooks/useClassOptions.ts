import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store'
import { classesApi } from '@/features/classes/api'
import { queryKeys } from '@/config/query-keys'

export function useClassOptions() {
  const role = useAuthStore((s) => s.user?.role)

  const adminQuery = useQuery({
    queryKey: queryKeys.classes.list({ scope: 'admin' }),
    queryFn: async () => {
      const result = await classesApi.list({ isActive: true, limit: 100 })
      return result.data
    },
    enabled: role === 'ADMIN',
  })

  const lecturerQuery = useQuery({
    queryKey: queryKeys.classes.list({ scope: 'assigned' }),
    queryFn: () => classesApi.listAssigned(),
    enabled: role === 'LECTURER',
  })

  const studentQuery = useQuery({
    queryKey: queryKeys.classes.list({ scope: 'enrolled' }),
    queryFn: () => classesApi.listEnrolled(),
    enabled: role === 'STUDENT',
  })

  if (role === 'ADMIN') {
    return {
      classes: adminQuery.data ?? [],
      isLoading: adminQuery.isLoading,
      error: adminQuery.error,
    }
  }

  if (role === 'LECTURER') {
    return {
      classes: lecturerQuery.data ?? [],
      isLoading: lecturerQuery.isLoading,
      error: lecturerQuery.error,
    }
  }

  if (role === 'STUDENT') {
    return {
      classes: studentQuery.data ?? [],
      isLoading: studentQuery.isLoading,
      error: studentQuery.error,
    }
  }

  return { classes: [], isLoading: false, error: null }
}
