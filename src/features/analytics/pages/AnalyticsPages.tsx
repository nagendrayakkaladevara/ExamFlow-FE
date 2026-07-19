import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
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
    queryKey: queryKeys.analytics.dashboard('student'),
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
        <Card>
          <CardHeader>
            <CardTitle>Total attempts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{query.data.totalAttempts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average score</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {query.data.averageScore != null ? query.data.averageScore.toFixed(1) : '—'}
          </CardContent>
        </Card>
      </div>
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
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.recent.map((item) => (
                <TableRow key={item.assignmentId}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {item.score ?? '—'} / {item.maxScore ?? '—'}
                  </TableCell>
                  <TableCell>{formatDateTime(item.submittedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminAnalyticsPage() {
  const query = useQuery({
    queryKey: queryKeys.analytics.dashboard('admin'),
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
      <Card>
        <CardHeader>
          <CardTitle>Completed submissions</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {query.data.completedSubmissions}
        </CardContent>
      </Card>
    </div>
  )
}

function LecturerAnalyticsPage() {
  const { classes } = useClassOptions()
  const firstClass = classes[0]

  const classQuery = useQuery({
    queryKey: queryKeys.analytics.dashboard(`class-${firstClass?.id}`),
    queryFn: () => analyticsApi.lecturerClass(firstClass!.id),
    enabled: Boolean(firstClass?.id),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Class and assignment performance insights." />
      {firstClass && classQuery.data ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Students" value={classQuery.data.studentCount} />
          <StatCard title="Assignments" value={classQuery.data.assignmentCount} />
          <StatCard title="Submissions" value={classQuery.data.completedSubmissions} />
          <StatCard title="Completion" value={formatPercent(classQuery.data.completionRate)} />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Assign yourself to a class to see analytics here.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  )
}
