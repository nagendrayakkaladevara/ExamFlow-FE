import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/features/analytics/api'
import { queryKeys } from '@/config/query-keys'
import type { AssignmentRosterParams } from '@/types/domain'

export function useAssignmentRoster(
  assignmentId: string,
  params: AssignmentRosterParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.analytics.lecturerAssignment(assignmentId, params),
    queryFn: () => analyticsApi.lecturerAssignment(assignmentId, params),
    enabled: Boolean(assignmentId) && (options?.enabled ?? true),
  })
}
