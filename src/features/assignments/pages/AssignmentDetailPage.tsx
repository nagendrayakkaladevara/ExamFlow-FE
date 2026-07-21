import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssignmentQuestionsPanel } from '@/features/assignments/components/AssignmentQuestionsPanel'
import { AssignmentStudentsPanel } from '@/features/assignments/components/AssignmentStudentsPanel'
import { assignmentsApi } from '@/features/assignments/api'
import { analyticsApi } from '@/features/analytics/api'
import { AssignmentTimingBadge } from '@/features/dashboard/components/AssignmentStatusBadge'
import { MetricCard, MetricCardSkeleton } from '@/features/dashboard/components/MetricCard'
import {
  formatAssignmentTimingMeta,
  getAssignmentTimingStatus,
} from '@/features/dashboard/utils'
import { getTotalMarks, formatStudentLabel } from '@/features/assignments/utils'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime, formatPercent } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'

function AssignmentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

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

  if (query.isLoading) return <AssignmentDetailSkeleton />
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

  const timingStatus = getAssignmentTimingStatus(assignment)
  const totalMarks = getTotalMarks(assignment.questions)
  const analytics = analyticsQuery.data

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title={assignment.title}
        description={assignment.description ?? formatAssignmentTimingMeta(assignment)}
        actions={
          <Button variant="outline" asChild>
            <Link to="/lecturer/assignments">Back to assignments</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <AssignmentTimingBadge status={timingStatus} />
        {assignment.isPublished ? (
          <span className="text-xs text-muted-foreground">Published</span>
        ) : (
          <span className="text-xs text-muted-foreground">Draft</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsQuery.isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Enrolled"
              value={analytics?.enrolled ?? '—'}
              description="Students assigned"
            />
            <MetricCard
              label="Submitted"
              value={analytics?.submitted ?? '—'}
              description={
                analytics ? `${formatPercent(analytics.completionRate)} completion` : undefined
              }
            />
            <MetricCard
              label="Questions"
              value={assignment.questions.length}
              description={`${totalMarks} total marks`}
            />
            <MetricCard
              label="Duration"
              value={`${assignment.durationMinutes} min`}
              description={`Closes ${formatDateTime(assignment.endAt)}`}
            />
          </>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">
            Questions ({assignment.questions.length})
          </TabsTrigger>
          <TabsTrigger value="students">
            Students
            {analytics ? ` (${analytics.submitted}/${analytics.enrolled})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-base font-semibold">Schedule</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Opens
                </dt>
                <dd className="mt-1 text-sm">{formatDateTime(assignment.startAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Closes
                </dt>
                <dd className="mt-1 text-sm">{formatDateTime(assignment.endAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Duration
                </dt>
                <dd className="mt-1 text-sm">{assignment.durationMinutes} minutes</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Result policy
                </dt>
                <dd className="mt-1 text-sm">
                  {assignment.resultPolicy.replaceAll('_', ' ').toLowerCase()}
                </dd>
              </div>
            </dl>
          </section>

          {analytics ? (
            <section className="rounded-lg border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Completion summary</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {analytics.submitted} of {analytics.enrolled} students have submitted (
                    {formatPercent(analytics.completionRate)}).
                  </p>
                </div>
              </div>
              {analytics.rankings.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Top submissions
                  </p>
                  <ul className="divide-y rounded-lg border">
                    {analytics.rankings.slice(0, 5).map((row) => (
                      <li
                        key={row.studentId}
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                      >
                        <span className="font-medium">
                          {row.rank != null ? `#${row.rank} · ` : ''}
                          {formatStudentLabel(row)}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {row.score ?? '—'} / {row.maxScore ?? '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : analyticsQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : analyticsQuery.error ? (
            <QueryError
              error={analyticsQuery.error}
              onRetry={() => analyticsQuery.refetch()}
              title="Unable to load analytics"
            />
          ) : null}
        </TabsContent>

        <TabsContent value="questions">
          <AssignmentQuestionsPanel questions={assignment.questions} />
        </TabsContent>

        <TabsContent value="students">
          {analyticsQuery.error ? (
            <QueryError
              error={analyticsQuery.error}
              onRetry={() => analyticsQuery.refetch()}
              title="Unable to load student data"
            />
          ) : (
            <AssignmentStudentsPanel
              analytics={analytics}
              isLoading={analyticsQuery.isLoading}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
