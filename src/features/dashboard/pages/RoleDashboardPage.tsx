import { Link } from 'react-router-dom'
import { parseISO } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  KeyRound,
  Plus,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/feedback/LoadingSpinner'
import { AssignmentTimingBadge, SubmissionStatusBadge } from '@/features/dashboard/components/AssignmentStatusBadge'
import { DashboardListItem, DashboardPanel } from '@/features/dashboard/components/DashboardPanel'
import { MetricCard, MetricCardLoading } from '@/features/dashboard/components/MetricCard'
import { AdminSummaryMetrics } from '@/features/analytics/components/AdminSummaryMetrics'
import { LecturerSummaryMetrics } from '@/features/analytics/components/LecturerSummaryMetrics'
import { QuickActions } from '@/features/dashboard/components/QuickActions'
import {
  formatActivityTimestamp,
  formatAssignmentTimingMeta,
  getAssignmentTimingStatus,
  sortAssignmentsByRelevance,
} from '@/features/dashboard/utils'
import { analyticsApi } from '@/features/analytics/api'
import { WeakTopicsPreview } from '@/features/analytics/components/WeakTopicsPreview'
import { assignmentsApi } from '@/features/assignments/api'
import { circularsApi } from '@/features/circulars/api'
import { formatCircularFeedMeta } from '@/features/circulars/circular-meta'
import { pollsApi } from '@/features/polls/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { getRoleBasePath } from '@/config/navigation'

function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">{children}</div>
}

function AdminDashboard() {
  const basePath = getRoleBasePath('ADMIN')

  const overviewQuery = useQuery({
    queryKey: queryKeys.analytics.adminOverview(),
    queryFn: () => analyticsApi.adminOverview(),
  })

  const activityQuery = useQuery({
    queryKey: queryKeys.analytics.adminActivity({ limit: 10 }),
    queryFn: () => analyticsApi.adminActivity({ limit: 10 }),
  })

  const circularsQuery = useQuery({
    queryKey: [...queryKeys.circulars.all, 'dashboard-admin'],
    queryFn: async () => {
      const result = await circularsApi.list({ limit: 5 })
      return result.data
    },
  })

  const activityItems = activityQuery.data?.items ?? []

  if (overviewQuery.error) {
    return <QueryError error={overviewQuery.error} onRetry={() => overviewQuery.refetch()} />
  }

  return (
    <>
      <AdminSummaryMetrics data={overviewQuery.data} isLoading={overviewQuery.isLoading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardPanel
            title="Recent activity"
            description="Latest publishes and announcements"
            viewAllHref={`${basePath}/analytics?tab=activity`}
          >
            {activityQuery.isLoading ? (
              <ActivityLoading />
            ) : activityItems.length > 0 ? (
              activityItems.map((item) => (
                <DashboardListItem
                  key={item.id}
                  title={item.resourceLabel}
                  meta={
                    item.actorName
                      ? `${item.type.replaceAll('_', ' ').toLowerCase()} · ${item.actorName}`
                      : item.type.replaceAll('_', ' ').toLowerCase()
                  }
                  href={`${basePath}/analytics?tab=activity`}
                  trailing={
                    <span className="text-xs text-muted-foreground">
                      {formatActivityTimestamp(item.occurredAt)}
                    </span>
                  }
                />
              ))
            ) : (
              <PanelEmptyState
                title="No recent activity"
                description="Platform events will appear here."
              />
            )}
          </DashboardPanel>
        </div>

        <QuickActions
          actions={[
            { label: 'Add user', href: `${basePath}/users/new`, icon: Plus, variant: 'default' },
            { label: 'Manage classes', href: `${basePath}/classes`, icon: GraduationCap },
            { label: 'View reports', href: `${basePath}/analytics?tab=reports`, icon: FileText },
            { label: 'View analytics', href: `${basePath}/analytics`, icon: BarChart3 },
            { label: 'Manage users', href: `${basePath}/users`, icon: Users },
          ]}
        />
      </div>

      <DashboardPanel title="Latest circulars" viewAllHref={`${basePath}/circulars`}>
        {circularsQuery.isLoading ? (
          <ActivityLoading />
        ) : (circularsQuery.data ?? []).length > 0 ? (
          (circularsQuery.data ?? []).map((circular) => (
            <DashboardListItem
              key={circular.id}
              title={circular.title}
              meta={formatCircularFeedMeta(circular, { includePublishedPrefix: true })}
              href={`${basePath}/circulars/${circular.id}`}
            />
          ))
        ) : (
          <PanelEmptyState
            title="No circulars yet"
            description="Announcements from your institution will show here."
          />
        )}
      </DashboardPanel>
    </>
  )
}

function LecturerDashboard() {
  const basePath = getRoleBasePath('LECTURER')

  const summaryQuery = useQuery({
    queryKey: queryKeys.analytics.lecturerSummary(),
    queryFn: () => analyticsApi.lecturerSummary(),
  })

  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ scope: 'dashboard-lecturer' }),
    queryFn: () => assignmentsApi.list(),
  })

  const circularsQuery = useQuery({
    queryKey: [...queryKeys.circulars.all, 'dashboard-lecturer'],
    queryFn: async () => {
      const result = await circularsApi.list({ limit: 5 })
      return result.data
    },
  })

  const pollsQuery = useQuery({
    queryKey: [...queryKeys.polls.all, 'dashboard-lecturer'],
    queryFn: async () => {
      const result = await pollsApi.list({ limit: 5 })
      return result.data
    },
  })

  const recentAssignments = (assignmentsQuery.data ?? [])
    .slice()
    .sort((a, b) => parseISO(b.updatedAt).getTime() - parseISO(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <>
      <LecturerSummaryMetrics
        totals={summaryQuery.data?.totals}
        isLoading={summaryQuery.isLoading}
      />

      {!summaryQuery.isLoading && !summaryQuery.data ? (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Assign yourself to a class to see performance metrics here.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DashboardPanel
            title="Recent assignments"
            description="Your latest assessments"
            viewAllHref={`${basePath}/assignments`}
          >
            {assignmentsQuery.isLoading ? (
              <ActivityLoading />
            ) : recentAssignments.length > 0 ? (
              recentAssignments.map((assignment) => (
                <DashboardListItem
                  key={assignment.id}
                  title={assignment.title}
                  meta={formatAssignmentTimingMeta(assignment)}
                  href={`${basePath}/assignments/${assignment.id}`}
                  trailing={
                    <AssignmentTimingBadge status={getAssignmentTimingStatus(assignment)} />
                  }
                />
              ))
            ) : (
              <PanelEmptyState
                title="No assignments yet"
                description="Create your first assignment to start assessing students."
                actionHref={`${basePath}/assignments/new`}
                actionLabel="Create assignment"
              />
            )}
          </DashboardPanel>

          <DashboardPanel title="Active polls" viewAllHref={`${basePath}/polls`}>
            {pollsQuery.isLoading ? (
              <ActivityLoading />
            ) : (pollsQuery.data ?? []).length > 0 ? (
              (pollsQuery.data ?? []).map((poll) => (
                <DashboardListItem
                  key={poll.id}
                  title={poll.title}
                  meta={`${poll.postedBy} · ${poll.optionsLabel} · Expires ${formatDateTime(poll.expireAt)}`}
                  href={`${basePath}/polls/${poll.id}`}
                />
              ))
            ) : (
              <PanelEmptyState
                title="No active polls"
                description="Published polls will appear here."
              />
            )}
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <QuickActions
            actions={[
              {
                label: 'Create assignment',
                href: `${basePath}/assignments/new`,
                icon: ClipboardList,
                variant: 'default',
              },
              { label: 'Add question', href: `${basePath}/questions/new`, icon: BookOpen },
              { label: 'View analytics', href: `${basePath}/analytics`, icon: BarChart3 },
            ]}
          />

          <DashboardPanel title="Announcements" viewAllHref={`${basePath}/circulars`}>
            {circularsQuery.isLoading ? (
              <ActivityLoading />
            ) : (circularsQuery.data ?? []).length > 0 ? (
              (circularsQuery.data ?? []).slice(0, 3).map((circular) => (
                <DashboardListItem
                  key={circular.id}
                  title={circular.title}
                  meta={formatCircularFeedMeta(circular)}
                  href={`${basePath}/circulars/${circular.id}`}
                />
              ))
            ) : (
              <PanelEmptyState title="No announcements" description="Circulars will show here." />
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}

function StudentDashboard() {
  const basePath = getRoleBasePath('STUDENT')

  const analyticsQuery = useQuery({
    queryKey: queryKeys.analytics.studentMe(),
    queryFn: () => analyticsApi.studentMe(),
  })

  const tagQuery = useQuery({
    queryKey: queryKeys.analytics.studentByTag(),
    queryFn: () => analyticsApi.studentByTag(),
  })

  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ scope: 'dashboard-student' }),
    queryFn: () => assignmentsApi.list(),
  })

  const circularsQuery = useQuery({
    queryKey: [...queryKeys.circulars.all, 'dashboard-student'],
    queryFn: async () => {
      const result = await circularsApi.list({ limit: 5 })
      return result.data
    },
  })

  const upcomingAssignments = sortAssignmentsByRelevance(assignmentsQuery.data ?? [])
    .filter((assignment) => getAssignmentTimingStatus(assignment) !== 'closed')
    .slice(0, 5)

  const recentResults = (analyticsQuery.data?.recent ?? []).slice(0, 5)

  if (analyticsQuery.error) {
    return <QueryError error={analyticsQuery.error} onRetry={() => analyticsQuery.refetch()} />
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {analyticsQuery.isLoading ? (
          <>
            <MetricCardLoading />
            <MetricCardLoading />
          </>
        ) : analyticsQuery.data ? (
          <>
            <MetricCard
              label="Total attempts"
              value={analyticsQuery.data.totalAttempts}
              description="Completed assignments"
            />
            <MetricCard
              label="Average score"
              value={
                analyticsQuery.data.averageScore != null
                  ? `${analyticsQuery.data.averageScore.toFixed(1)}%`
                  : '—'
              }
              description="Across all submissions"
            />
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DashboardPanel
            title="Upcoming assignments"
            description="Open and scheduled assessments"
            viewAllHref={`${basePath}/assignments`}
          >
            {assignmentsQuery.isLoading ? (
              <ActivityLoading />
            ) : upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((assignment) => (
                <DashboardListItem
                  key={assignment.id}
                  title={assignment.title}
                  meta={formatAssignmentTimingMeta(assignment)}
                  href={`${basePath}/assignments/${assignment.id}`}
                  trailing={
                    <AssignmentTimingBadge status={getAssignmentTimingStatus(assignment)} />
                  }
                />
              ))
            ) : (
              <PanelEmptyState
                title="No upcoming assignments"
                description="Check back when your lecturer publishes new work."
              />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Recent results"
            description="Your latest scores"
            viewAllHref={`${basePath}/analytics`}
            viewAllLabel="View performance"
          >
            {analyticsQuery.isLoading ? (
              <ActivityLoading />
            ) : recentResults.length > 0 ? (
              recentResults.map((result) => (
                <DashboardListItem
                  key={result.assignmentId}
                  title={result.title}
                  meta={
                    result.submittedAt
                      ? `Submitted ${formatDateTime(result.submittedAt)}`
                      : 'Not submitted'
                  }
                  href={`${basePath}/assignments/${result.assignmentId}/result`}
                  trailing={
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium tabular-nums">
                        {result.score ?? '—'}
                        {result.maxScore != null ? ` / ${result.maxScore}` : ''}
                      </span>
                      <SubmissionStatusBadge status={result.status} />
                    </div>
                  }
                />
              ))
            ) : (
              <PanelEmptyState
                title="No results yet"
                description="Complete an assignment to see your scores here."
                actionHref={`${basePath}/assignments`}
                actionLabel="View assignments"
              />
            )}
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <WeakTopicsPreview
            data={tagQuery.data}
            isLoading={tagQuery.isLoading}
            analyticsHref={`${basePath}/analytics`}
          />

          <QuickActions
            title="Quick links"
            actions={[
              {
                label: 'Assignments',
                href: `${basePath}/assignments`,
                icon: ClipboardList,
                variant: 'default',
              },
              { label: 'My performance', href: `${basePath}/analytics`, icon: BarChart3 },
              { label: 'Change password', href: '/account/password', icon: KeyRound },
            ]}
          />

          <DashboardPanel title="Announcements" viewAllHref={`${basePath}/circulars`}>
            {circularsQuery.isLoading ? (
              <ActivityLoading />
            ) : (circularsQuery.data ?? []).length > 0 ? (
              (circularsQuery.data ?? []).slice(0, 4).map((circular) => (
                <DashboardListItem
                  key={circular.id}
                  title={circular.title}
                  meta={formatCircularFeedMeta(circular)}
                  href={`${basePath}/circulars/${circular.id}`}
                />
              ))
            ) : (
              <PanelEmptyState
                title="No announcements"
                description="Institution updates will appear here."
              />
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}

export function RoleDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        description={
          user
            ? `Welcome back, ${user.firstName}. Here is what needs your attention.`
            : undefined
        }
      />

      {role === 'ADMIN' ? <AdminDashboard /> : null}
      {role === 'LECTURER' ? <LecturerDashboard /> : null}
      {role === 'STUDENT' ? <StudentDashboard /> : null}
    </DashboardShell>
  )
}

function ActivityLoading() {
  return <LoadingState minHeightClassName="min-h-40" />
}

function PanelEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="py-6">
      <EmptyState
        title={title}
        description={description}
        action={
          actionHref && actionLabel ? (
            <Button asChild>
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
