import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { assignmentsApi } from '@/features/assignments/api'
import {
  getAssignmentDisplayStatus,
  sortAssignmentsByDisplayStatus,
} from '@/features/assignments/utils'
import { analyticsApi } from '@/features/analytics/api'
import { AssignmentDisplayStatusBadge } from '@/features/dashboard/components/AssignmentStatusBadge'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import type { AssignmentRecord } from '@/types/domain'

export function AssignmentsListPage() {
  const role = useAuthStore((s) => s.user?.role)
  const isLecturer = role === 'LECTURER'
  const isStudent = role === 'STUDENT'

  const query = useQuery({
    queryKey: queryKeys.assignments.list({ role }),
    queryFn: () => assignmentsApi.list(),
  })

  const studentAnalyticsQuery = useQuery({
    queryKey: queryKeys.analytics.dashboard('assignments-list'),
    queryFn: () => analyticsApi.studentMe(),
    enabled: isStudent,
  })

  const submissionStatusByAssignmentId = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of studentAnalyticsQuery.data?.recent ?? []) {
      map.set(item.assignmentId, item.status)
    }
    return map
  }, [studentAnalyticsQuery.data])

  const getStatus = (assignment: AssignmentRecord) =>
    getAssignmentDisplayStatus(assignment, {
      role: role ?? 'STUDENT',
      submissionStatus: submissionStatusByAssignmentId.get(assignment.id) ?? null,
    })

  const assignments = useMemo(() => {
    const items = query.data ?? []
    if (!items.length) return items
    return sortAssignmentsByDisplayStatus(items, getStatus)
  }, [query.data, role, submissionStatusByAssignmentId])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description={
          isLecturer
            ? 'Create assessments and monitor student progress.'
            : 'View open assignments, history, and results.'
        }
        actions={
          isLecturer ? (
            <Button asChild>
              <Link to="/lecturer/assignments/new">
                <Plus className="size-4" />
                Create assignment
              </Link>
            </Button>
          ) : undefined
        }
      />

      {query.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {query.error ? <QueryError error={query.error} onRetry={() => query.refetch()} /> : null}

      {query.data?.length === 0 ? (
        <EmptyState
          title={isLecturer ? 'No assignments yet' : 'No assignments available'}
          description={
            isLecturer
              ? 'Create your first assignment to assess students.'
              : 'Check back when your lecturer publishes an assignment.'
          }
        />
      ) : null}

      {assignments.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opens</TableHead>
                <TableHead>Closes</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>
                    <AssignmentDisplayStatusBadge status={getStatus(assignment)} />
                  </TableCell>
                  <TableCell>{formatDateTime(assignment.startAt)}</TableCell>
                  <TableCell>{formatDateTime(assignment.endAt)}</TableCell>
                  <TableCell>{assignment.durationMinutes} min</TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant={isLecturer ? 'default' : 'ghost'}
                      size="sm"
                    >
                      <Link
                        to={
                          isLecturer
                            ? `/lecturer/assignments/${assignment.id}`
                            : `/student/assignments/${assignment.id}`
                        }
                      >
                        {isLecturer ? 'Manage' : 'Open'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}
