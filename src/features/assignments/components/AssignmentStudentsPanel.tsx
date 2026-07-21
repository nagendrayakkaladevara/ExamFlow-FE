import { useMemo } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  formatStudentLabel,
  getPendingCount,
  partitionStudents,
  type StudentRankingRow,
} from '@/features/assignments/utils'
import { formatDateTime, formatPercent } from '@/lib/format'
import type { LecturerAssignmentAnalytics } from '@/types/domain'

interface AssignmentStudentsPanelProps {
  analytics: LecturerAssignmentAnalytics | undefined
  isLoading?: boolean
  error?: unknown
}

function StudentTable({
  rows,
  showRank = false,
  showScore = false,
}: {
  rows: StudentRankingRow[]
  showRank?: boolean
  showScore?: boolean
}) {
  if (rows.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {showRank ? <TableHead className="w-16">Rank</TableHead> : null}
            <TableHead>Student</TableHead>
            {showScore ? <TableHead>Score</TableHead> : null}
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.studentId}>
              {showRank ? (
                <TableCell className="tabular-nums text-muted-foreground">
                  {row.rank ?? '—'}
                </TableCell>
              ) : null}
              <TableCell className="font-medium">{formatStudentLabel(row)}</TableCell>
              {showScore ? (
                <TableCell className="tabular-nums">
                  {row.score ?? '—'} / {row.maxScore ?? '—'}
                </TableCell>
              ) : null}
              <TableCell>
                <SubmissionBadge submittedAt={row.submittedAt} status={row.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(row.submittedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SubmissionBadge({
  submittedAt,
  status,
}: {
  submittedAt: string | null
  status?: string | null
}) {
  const isCompleted =
    status?.toUpperCase() === 'SUBMITTED' ||
    status?.toUpperCase() === 'AUTO_SUBMITTED' ||
    Boolean(submittedAt)

  return (
    <Badge
      variant="secondary"
      className={
        isCompleted
          ? 'bg-emerald-50 font-medium text-emerald-600'
          : 'bg-amber-50 font-medium text-amber-600'
      }
    >
      {isCompleted ? 'Completed' : 'Pending'}
    </Badge>
  )
}

function PanelEmpty({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed p-8">
      <EmptyState title={title} description={description} />
    </div>
  )
}

export function AssignmentStudentsPanel({
  analytics,
  isLoading,
}: AssignmentStudentsPanelProps) {
  const rankings = useMemo(
    () => (analytics?.rankings ?? []) as StudentRankingRow[],
    [analytics?.rankings],
  )
  const { completed, pending } = useMemo(() => partitionStudents(rankings), [rankings])
  const pendingCount = analytics ? getPendingCount(analytics, rankings) : 0
  const hasRosterGap = pendingCount > 0 && pending.length === 0

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!analytics) {
    return (
      <PanelEmpty
        title="Student data unavailable"
        description="Completion details will appear once analytics are available."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Enrolled
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{analytics.enrolled}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Completed
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{analytics.submitted}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pending
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{pendingCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatPercent(analytics.completionRate)} completion rate
          </p>
        </div>
      </div>

      <Tabs defaultValue="completed">
        <TabsList>
          <TabsTrigger value="completed">
            Completed ({completed.length || analytics.submitted})
          </TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="all">All ({analytics.enrolled})</TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {completed.length > 0 ? (
            <StudentTable rows={completed} showRank showScore />
          ) : analytics.submitted > 0 ? (
            <PanelEmpty
              title="Submitted students not listed"
              description="The API returned submission counts but no student roster. Ask the backend to include all enrolled students in the rankings response."
            />
          ) : (
            <PanelEmpty
              title="No submissions yet"
              description="Students will appear here once they submit this assignment."
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pending.length > 0 ? (
            <StudentTable rows={pending} />
          ) : hasRosterGap ? (
            <PanelEmpty
              title={`${pendingCount} student${pendingCount === 1 ? '' : 's'} pending`}
              description="Pending students are counted but not listed individually. The backend should return all enrolled students in rankings with null submittedAt for those who have not submitted."
            />
          ) : (
            <PanelEmpty
              title="Everyone has submitted"
              description="All enrolled students have completed this assignment."
            />
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          {rankings.length > 0 ? (
            <StudentTable rows={rankings} showRank showScore />
          ) : (
            <PanelEmpty
              title="No student roster"
              description="Student details will appear when the backend returns enrolled students for this assignment."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
