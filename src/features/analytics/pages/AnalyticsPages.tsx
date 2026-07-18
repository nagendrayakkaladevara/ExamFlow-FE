import { Link } from 'react-router-dom'
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
import { analyticsApi } from '@/features/analytics/api'
import { assignmentsApi } from '@/features/assignments/api'
import { circularsApi } from '@/features/circulars/api'
import { pollsApi } from '@/features/polls/api'
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

export function RoleDashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  const user = useAuthStore((s) => s.user)

  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ scope: 'dashboard' }),
    queryFn: () => assignmentsApi.list(),
  })

  const circularsQuery = useQuery({
    queryKey: [...queryKeys.circulars.all, 'dashboard'],
    queryFn: async () => {
      const result = await circularsApi.list({ limit: 5 })
      return result.data
    },
  })

  const pollsQuery = useQuery({
    queryKey: [...queryKeys.polls.all, 'dashboard'],
    queryFn: async () => {
      const result = await pollsApi.list({ limit: 5 })
      return result.data
    },
  })

  const adminOverviewQuery = useQuery({
    queryKey: queryKeys.analytics.dashboard('admin-home'),
    queryFn: () => analyticsApi.adminOverview(),
    enabled: role === 'ADMIN',
  })

  const studentAnalyticsQuery = useQuery({
    queryKey: queryKeys.analytics.dashboard('student-home'),
    queryFn: () => analyticsApi.studentMe(),
    enabled: role === 'STUDENT',
  })

  const basePath =
    role === 'ADMIN' ? '/admin' : role === 'LECTURER' ? '/lecturer' : '/student'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          user ? `Welcome back, ${user.firstName}. Here is what needs your attention.` : undefined
        }
      />

      {role === 'ADMIN' && adminOverviewQuery.data ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Students" value={adminOverviewQuery.data.usersByRole.STUDENT ?? 0} />
          <StatCard title="Classes" value={adminOverviewQuery.data.activeClasses} />
          <StatCard title="Assignments" value={adminOverviewQuery.data.totalAssignments} />
          <StatCard title="Submissions" value={adminOverviewQuery.data.completedSubmissions} />
        </div>
      ) : null}

      {role === 'STUDENT' && studentAnalyticsQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard title="Attempts" value={studentAnalyticsQuery.data.totalAttempts} />
          <StatCard
            title="Average score"
            value={
              studentAnalyticsQuery.data.averageScore != null
                ? studentAnalyticsQuery.data.averageScore.toFixed(1)
                : '—'
            }
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {role === 'STUDENT' ? 'Open assignments' : 'Recent assignments'}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${basePath}/assignments`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(assignmentsQuery.data ?? []).slice(0, 5).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between text-sm">
                <span>{assignment.title}</span>
                <Button variant="link" size="sm" asChild>
                  <Link
                    to={
                      role === 'STUDENT'
                        ? `/student/assignments/${assignment.id}`
                        : `/lecturer/assignments/${assignment.id}`
                    }
                  >
                    Open
                  </Link>
                </Button>
              </div>
            ))}
            {!assignmentsQuery.data?.length ? (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Latest circulars</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${basePath}/circulars`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(circularsQuery.data ?? []).slice(0, 5).map((circular) => (
              <div key={circular.id} className="flex items-center justify-between text-sm">
                <span>{circular.title}</span>
                <Button variant="link" size="sm" asChild>
                  <Link to={`${basePath}/circulars/${circular.id}`}>Read</Link>
                </Button>
              </div>
            ))}
            {!circularsQuery.data?.length ? (
              <p className="text-sm text-muted-foreground">No circulars yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active polls</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`${basePath}/polls`}>View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(pollsQuery.data ?? []).slice(0, 5).map((poll) => (
            <div key={poll.id} className="flex items-center justify-between text-sm">
              <span>{poll.title}</span>
              <Button variant="link" size="sm" asChild>
                <Link to={`${basePath}/polls/${poll.id}`}>Open</Link>
              </Button>
            </div>
          ))}
          {!pollsQuery.data?.length ? (
            <p className="text-sm text-muted-foreground">No active polls.</p>
          ) : null}
        </CardContent>
      </Card>

      {role === 'ADMIN' ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/admin/users/new">Add user</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/classes">Manage classes</Link>
          </Button>
        </div>
      ) : null}

      {role === 'LECTURER' ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/lecturer/questions/new">Add question</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/lecturer/assignments/new">Create assignment</Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
