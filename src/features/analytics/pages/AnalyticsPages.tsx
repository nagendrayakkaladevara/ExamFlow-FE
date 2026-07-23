import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActivityFeedList } from '@/features/analytics/components/ActivityFeedList'
import { AdminTrendChart } from '@/features/analytics/components/AdminTrendChart'
import { AlertsList } from '@/features/analytics/components/AlertsList'
import { ClassAnalyticsGrid } from '@/features/analytics/components/ClassAnalyticsGrid'
import { DateRangeFilter } from '@/features/analytics/components/DateRangeFilter'
import { ExportCsvButton } from '@/features/analytics/components/ExportCsvButton'
import { PerformanceTrendChart } from '@/features/analytics/components/PerformanceTrendChart'
import { WeakTopicsPanel } from '@/features/analytics/components/WeakTopicsPanel'
import { analyticsApi } from '@/features/analytics/api'
import { useDateRangeFilter } from '@/features/analytics/hooks/useDateRangeFilter'
import { MetricCard, MetricCardSkeleton } from '@/features/dashboard/components/MetricCard'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime, formatPercent } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useClassOptions } from '@/hooks/useClassOptions'
import { assignmentsApi } from '@/features/assignments/api'
import { subDays } from 'date-fns'
import type { AdminTrends } from '@/types/domain'

export function AnalyticsPage() {
  const role = useAuthStore((s) => s.user?.role)

  if (role === 'STUDENT') return <StudentAnalyticsPage />
  if (role === 'ADMIN') return <AdminAnalyticsPage />
  return <LecturerAnalyticsPage />
}

function StudentAnalyticsPage() {
  const dateRange = useDateRangeFilter('all')

  const query = useQuery({
    queryKey: queryKeys.analytics.studentMe(dateRange.params),
    queryFn: () => analyticsApi.studentMe(dateRange.params),
  })

  const tagQuery = useQuery({
    queryKey: queryKeys.analytics.studentByTag(dateRange.params),
    queryFn: () => analyticsApi.studentByTag(dateRange.params),
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="My Performance"
        description="Track your assignment scores and recent activity."
      />

      <DateRangeFilter
        preset={dateRange.preset}
        onPresetChange={dateRange.setPreset}
        customFrom={dateRange.customFrom}
        customTo={dateRange.customTo}
        onCustomFromChange={dateRange.setCustomFrom}
        onCustomToChange={dateRange.setCustomTo}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total attempts" value={query.data.totalAttempts} />
        <MetricCard
          label="Average score"
          value={
            query.data.averageScore != null
              ? `${query.data.averageScore.toFixed(1)}%`
              : '—'
          }
        />
      </div>

      {query.data.trend.length > 0 ? <PerformanceTrendChart points={query.data.trend} /> : null}

      <WeakTopicsPanel
        data={tagQuery.data}
        isLoading={tagQuery.isLoading}
        error={tagQuery.error}
        onRetry={() => tagQuery.refetch()}
      />

      <section className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="text-base font-semibold">Recent assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Correct / incorrect</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No submitted assignments yet.
                  </TableCell>
                </TableRow>
              ) : (
                query.data.recent.map((item) => (
                  <TableRow key={item.assignmentId}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className="tabular-nums">
                      {item.score ?? '—'} / {item.maxScore ?? '—'}
                      {item.percentage != null ? ` (${item.percentage}%)` : ''}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {item.correctCount ?? '—'} / {item.incorrectCount ?? '—'}
                    </TableCell>
                    <TableCell>{formatDateTime(item.submittedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}

function LecturerAnalyticsPage() {
  const { classes } = useClassOptions()
  const [selectedClassId, setSelectedClassId] = useState('')
  const dateRange = useDateRangeFilter('all')

  const activeClassId = selectedClassId || classes[0]?.id || ''

  const summaryQuery = useQuery({
    queryKey: queryKeys.analytics.lecturerSummary(dateRange.params),
    queryFn: () => analyticsApi.lecturerSummary(dateRange.params),
  })

  const classQuery = useQuery({
    queryKey: queryKeys.analytics.lecturerClass(activeClassId, dateRange.params),
    queryFn: () => analyticsApi.lecturerClass(activeClassId, dateRange.params),
    enabled: Boolean(activeClassId),
  })

  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ classId: activeClassId, scope: 'analytics' }),
    queryFn: () => assignmentsApi.list(),
    enabled: Boolean(activeClassId),
    select: (assignments) => assignments.filter((item) => item.classId === activeClassId),
  })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Class and assignment performance insights."
      />

      <DateRangeFilter
        preset={dateRange.preset}
        onPresetChange={dateRange.setPreset}
        customFrom={dateRange.customFrom}
        customTo={dateRange.customTo}
        onCustomFromChange={dateRange.setCustomFrom}
        onCustomToChange={dateRange.setCustomTo}
      />

      {summaryQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      ) : summaryQuery.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Unique students"
            value={summaryQuery.data.totals.uniqueStudentCount}
          />
          <MetricCard label="Assignments" value={summaryQuery.data.totals.assignmentCount} />
          <MetricCard
            label="Completion"
            value={formatPercent(summaryQuery.data.totals.completionRate)}
          />
          <MetricCard
            label="Average score"
            value={
              summaryQuery.data.totals.averageScore != null
                ? `${summaryQuery.data.totals.averageScore}%`
                : '—'
            }
          />
        </div>
      ) : null}

      {summaryQuery.data && summaryQuery.data.classes.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Your classes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {summaryQuery.data.classes.map((cls) => (
              <Link
                key={cls.classId}
                to={`/lecturer/classes/${cls.classId}`}
                className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/30"
              >
                <p className="font-semibold">{cls.className}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {cls.studentCount} students · {cls.assignmentCount} assignments ·{' '}
                  {formatPercent(cls.completionRate)} completion
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {classes.length > 0 ? (
        <div className="max-w-sm space-y-1">
          <Label htmlFor="class-select">Class detail</Label>
          <Select value={activeClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger id="class-select">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                  {cls.code ? ` (${cls.code})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <EmptyState
          title="No class selected"
          description="Assign yourself to a class to see analytics here."
        />
      )}

      {classQuery.error ? (
        <QueryError error={classQuery.error} onRetry={() => classQuery.refetch()} />
      ) : null}

      {activeClassId ? (
        <ClassAnalyticsGrid data={classQuery.data} isLoading={classQuery.isLoading} />
      ) : null}

      {activeClassId && (assignmentsQuery.data?.length ?? 0) > 0 ? (
        <section className="rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="text-base font-semibold">Assignments in this class</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentsQuery.data?.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(assignment.startAt)} – {formatDateTime(assignment.endAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/lecturer/assignments/${assignment.id}/results`}>
                          View results
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function AdminAnalyticsPage() {
  const dateRange = useDateRangeFilter('30d')
  const [activityCursor, setActivityCursor] = useState<string | undefined>()
  const [trendMetric, setTrendMetric] = useState<AdminTrends['metric']>('submissions')
  const [trendInterval, setTrendInterval] = useState<AdminTrends['interval']>('week')
  const [reportType, setReportType] = useState('overview')

  const overviewQuery = useQuery({
    queryKey: queryKeys.analytics.adminOverview(dateRange.params),
    queryFn: () => analyticsApi.adminOverview(dateRange.params),
  })

  const activityQuery = useQuery({
    queryKey: queryKeys.analytics.adminActivity({ limit: 20, cursor: activityCursor }),
    queryFn: () => analyticsApi.adminActivity({ limit: 20, cursor: activityCursor }),
  })

  const trendRange = useMemo(() => {
    const to = new Date()
    const from = subDays(to, 90)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [])

  const trendsQuery = useQuery({
    queryKey: queryKeys.analytics.adminTrends({
      metric: trendMetric,
      interval: trendInterval,
      ...trendRange,
    }),
    queryFn: () =>
      analyticsApi.adminTrends({
        metric: trendMetric,
        interval: trendInterval,
        from: trendRange.from,
        to: trendRange.to,
      }),
  })

  const alertsQuery = useQuery({
    queryKey: queryKeys.analytics.adminAlerts({ threshold: 0.5 }),
    queryFn: () => analyticsApi.adminAlerts({ threshold: 0.5 }),
  })

  if (overviewQuery.isLoading) return <Skeleton className="h-64 w-full" />
  if (overviewQuery.error) {
    return <QueryError error={overviewQuery.error} onRetry={() => overviewQuery.refetch()} />
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Institution-wide performance overview and reports."
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DateRangeFilter
            preset={dateRange.preset}
            onPresetChange={dateRange.setPreset}
            customFrom={dateRange.customFrom}
            customTo={dateRange.customTo}
            onCustomFromChange={dateRange.setCustomFrom}
            onCustomToChange={dateRange.setCustomTo}
          />

          {overviewQuery.data ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Students"
                value={overviewQuery.data.usersByRole.STUDENT ?? 0}
              />
              <MetricCard
                label="Lecturers"
                value={overviewQuery.data.usersByRole.LECTURER ?? 0}
              />
              <MetricCard label="Active classes" value={overviewQuery.data.activeClasses} />
              <MetricCard label="Assignments" value={overviewQuery.data.totalAssignments} />
              <MetricCard
                label="Completed submissions"
                value={overviewQuery.data.completedSubmissions}
              />
              <MetricCard
                label="Average completion"
                value={formatPercent(overviewQuery.data.averageCompletionRate)}
              />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeedList
            items={activityQuery.data?.items ?? []}
            isLoading={activityQuery.isLoading}
            nextCursor={activityQuery.data?.nextCursor}
            isLoadingMore={activityQuery.isFetching}
            onLoadMore={() => {
              if (activityQuery.data?.nextCursor) {
                setActivityCursor(activityQuery.data.nextCursor)
              }
            }}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div className="w-full max-w-xs space-y-1">
              <Label>Metric</Label>
              <Select
                value={trendMetric}
                onValueChange={(value) => setTrendMetric(value as AdminTrends['metric'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submissions">Submissions</SelectItem>
                  <SelectItem value="averageScore">Average score</SelectItem>
                  <SelectItem value="completion">Completion rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full max-w-xs space-y-1">
              <Label>Interval</Label>
              <Select
                value={trendInterval}
                onValueChange={(value) => setTrendInterval(value as AdminTrends['interval'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {trendsQuery.isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : trendsQuery.data ? (
            <AdminTrendChart data={trendsQuery.data} />
          ) : null}
        </TabsContent>

        <TabsContent value="alerts">
          {alertsQuery.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <AlertsList alerts={alertsQuery.data ?? []} />
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="max-w-sm space-y-1">
            <Label>Report type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Institution overview</SelectItem>
                <SelectItem value="class-performance">Class performance</SelectItem>
                <SelectItem value="assignment-results">Assignment results</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ExportCsvButton
            label="Download report"
            filename={`${reportType}-report.csv`}
            onExport={() =>
              analyticsApi.exportAdminReport(reportType, {
                from: dateRange.params.from,
                to: dateRange.params.to,
              })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
