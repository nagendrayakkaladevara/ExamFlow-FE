import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { analyticsApi } from '@/features/analytics/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime, formatPercent } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useClassOptions } from '@/hooks/useClassOptions'

export function AnalyticsPage() {
  const role = useAuthStore((s) => s.user?.role)

  if (role === 'STUDENT') return <StudentAnalyticsPage />
  if (role === 'ADMIN') return <AdminAnalyticsPage />
  return <LecturerAnalyticsPage />
}

function StudentAnalyticsPage() {
  const query = useQuery({
    queryKey: queryKeys.analytics.studentMe(),
    queryFn: () => analyticsApi.studentMe(),
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Performance"
        description="Track your assignment scores and recent activity."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total attempts" value={query.data.totalAttempts} />
        <StatCard
          title="Average score"
          value={
            query.data.averageScore != null
              ? `${query.data.averageScore.toFixed(1)}%`
              : '—'
          }
        />
      </div>

      {query.data.trend.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Performance trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {query.data.trend.map((point, index) => (
              <div key={`${point.submittedAt}-${index}`} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatDateTime(point.submittedAt)}
                  </span>
                  <span className="font-medium tabular-nums">
                    {point.percentage != null ? `${point.percentage}%` : '—'}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${point.percentage ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent assignments</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableCell>
                      {item.score ?? '—'} / {item.maxScore ?? '—'}
                      {item.percentage != null ? ` (${item.percentage}%)` : ''}
                    </TableCell>
                    <TableCell>
                      {item.correctCount ?? '—'} / {item.incorrectCount ?? '—'}
                    </TableCell>
                    <TableCell>{formatDateTime(item.submittedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminAnalyticsPage() {
  const query = useQuery({
    queryKey: queryKeys.analytics.adminOverview(),
    queryFn: () => analyticsApi.adminOverview(),
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Institution-wide performance overview." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Students" value={query.data.usersByRole.STUDENT ?? 0} />
        <StatCard title="Lecturers" value={query.data.usersByRole.LECTURER ?? 0} />
        <StatCard title="Active classes" value={query.data.activeClasses} />
        <StatCard title="Assignments" value={query.data.totalAssignments} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Completed submissions" value={query.data.completedSubmissions} />
        <StatCard
          title="Average completion"
          value={formatPercent(query.data.averageCompletionRate)}
        />
      </div>
    </div>
  )
}

function LecturerAnalyticsPage() {
  const { classes } = useClassOptions()
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  const activeClassId = selectedClassId || classes[0]?.id || ''

  const classQuery = useQuery({
    queryKey: queryKeys.analytics.lecturerClass(activeClassId),
    queryFn: () => analyticsApi.lecturerClass(activeClassId),
    enabled: Boolean(activeClassId),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Class and assignment performance insights." />

      {classes.length > 0 ? (
        <div className="max-w-sm space-y-1">
          <Label htmlFor="class-select">Class</Label>
          <Select value={activeClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger id="class-select">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}{cls.code ? ` (${cls.code})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {classQuery.isLoading ? <Skeleton className="h-48 w-full" /> : null}
      {classQuery.error ? (
        <QueryError error={classQuery.error} onRetry={() => classQuery.refetch()} />
      ) : null}

      {activeClassId && classQuery.data ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Students" value={classQuery.data.studentCount} />
          <StatCard title="Assignments" value={classQuery.data.assignmentCount} />
          <StatCard title="Submissions" value={classQuery.data.completedSubmissions} />
          <StatCard title="Completion" value={formatPercent(classQuery.data.completionRate)} />
          <StatCard title="Passed" value={classQuery.data.passed} />
          <StatCard title="Failed" value={classQuery.data.failed} />
          <StatCard
            title="Average score"
            value={
              classQuery.data.averageScore != null
                ? `${classQuery.data.averageScore}%`
                : '—'
            }
          />
          <StatCard
            title="Highest / lowest"
            value={
              classQuery.data.highestScore != null && classQuery.data.lowestScore != null
                ? `${classQuery.data.highestScore}% / ${classQuery.data.lowestScore}%`
                : '—'
            }
          />
        </div>
      ) : !activeClassId ? (
        <EmptyState
          title="No class selected"
          description="Assign yourself to a class to see analytics here."
        />
      ) : null}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold tabular-nums">{value}</CardContent>
    </Card>
  )
}
