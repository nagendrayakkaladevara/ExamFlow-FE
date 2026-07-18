import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { analyticsApi } from '@/features/analytics/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'

export function AssignmentDetailPage() {
  const { id = '' } = useParams()
  const role = useAuthStore((s) => s.user?.role)
  const isLecturer = role === 'LECTURER'

  const query = useQuery({
    queryKey: [...queryKeys.assignments.all, id],
    queryFn: () => assignmentsApi.get(id),
    enabled: Boolean(id),
  })

  const analyticsQuery = useQuery({
    queryKey: queryKeys.analytics.dashboard(`assignment-${id}`),
    queryFn: () => analyticsApi.lecturerAssignment(id),
    enabled: Boolean(id) && isLecturer,
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  const assignment = query.data

  if (!isLecturer) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={assignment.title}
          description={assignment.description ?? undefined}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/student/assignments">Back</Link>
              </Button>
              <Button asChild>
                <Link to={`/student/assignments/${id}/take`}>Start assignment</Link>
              </Button>
            </div>
          }
        />
        <Card>
          <CardContent className="space-y-2 pt-6 text-sm">
            <p>Opens: {formatDateTime(assignment.startAt)}</p>
            <p>Closes: {formatDateTime(assignment.endAt)}</p>
            <p>Duration: {assignment.durationMinutes} minutes</p>
            <p>Questions: {assignment.questions.length}</p>
          </CardContent>
        </Card>
        <Button variant="outline" asChild>
          <Link to={`/student/assignments/${id}/result`}>View result</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={assignment.title}
        description={assignment.description ?? undefined}
        actions={
          <Button variant="outline" asChild>
            <Link to="/lecturer/assignments">Back</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Opens: {formatDateTime(assignment.startAt)}</p>
            <p>Closes: {formatDateTime(assignment.endAt)}</p>
            <p>Duration: {assignment.durationMinutes} min</p>
          </CardContent>
        </Card>
        {analyticsQuery.data ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Completion</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{analyticsQuery.data.submitted} / {analyticsQuery.data.enrolled} submitted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{assignment.questions.length} questions</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {analyticsQuery.data?.rankings.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Student rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsQuery.data.rankings.map((row) => (
                  <TableRow key={row.rank}>
                    <TableCell>{row.rank}</TableCell>
                    <TableCell>
                      {row.score ?? '—'} / {row.maxScore ?? '—'}
                    </TableCell>
                    <TableCell>{formatDateTime(row.submittedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
