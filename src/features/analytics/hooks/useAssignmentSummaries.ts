import { useQueries } from '@tanstack/react-query'
import { analyticsApi } from '@/features/analytics/api'
import { queryKeys } from '@/config/query-keys'
import type { ClassAssignmentChartItem } from '@/features/analytics/components/ClassAssignmentChart'

export function useAssignmentSummaries(assignmentIds: string[]) {
  const queries = useQueries({
    queries: assignmentIds.map((assignmentId) => ({
      queryKey: queryKeys.analytics.lecturerAssignment(assignmentId, {
        status: 'all',
        limit: 1,
      }),
      queryFn: () =>
        analyticsApi.lecturerAssignment(assignmentId, { status: 'all', limit: 1 }),
      enabled: Boolean(assignmentId),
      staleTime: 60_000,
    })),
  })

  const isLoading = queries.some((query) => query.isLoading)

  const items: ClassAssignmentChartItem[] = queries.flatMap((query) => {
    if (!query.data) return []
    return [
      {
        assignmentId: query.data.assignmentId,
        title: query.data.title,
        completionRate: query.data.completionRate,
      },
    ]
  })

  return { items, isLoading }
}
