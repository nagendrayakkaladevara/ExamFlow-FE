import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAssignmentRoster } from '@/features/analytics/hooks/useAssignmentRoster'
import { formatStudentLabel } from '@/features/analytics/utils/student-label'
import {
  getRosterStatusLabel,
  isCompletedStatus,
} from '@/features/analytics/utils/roster-status'
import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { formatDateTime, formatPercent } from '@/lib/format'
import type {
  AssignmentRosterRow,
  AssignmentRosterStatus,
  AssignmentRosterSubmissionStatus,
  LecturerAssignmentAnalytics,
} from '@/types/domain'

const ROSTER_PAGE_SIZE = 50

type RosterTab = AssignmentRosterStatus
type RosterSort = 'score' | 'name' | 'submittedAt'

interface AssignmentStudentsPanelProps {
  assignmentId: string
  summary?: Pick<LecturerAssignmentAnalytics, 'enrolled' | 'submitted' | 'completionRate'>
}

function RosterStatusBadge({ status }: { status: AssignmentRosterSubmissionStatus }) {
  const label = getRosterStatusLabel(status)

  if (isCompletedStatus(status)) {
    return (
      <Badge
        variant="secondary"
        className="border-emerald-200 bg-emerald-50 font-medium text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
      >
        {label}
      </Badge>
    )
  }

  if (status === 'IN_PROGRESS') {
    return (
      <Badge
        variant="secondary"
        className="border-sky-200 bg-sky-50 font-medium text-sky-600 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300"
      >
        {label}
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className="border-amber-200 bg-amber-50 font-medium text-amber-600 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
    >
      {label}
    </Badge>
  )
}

function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string
  active: boolean
  direction: RosterSort
  onClick: () => void
}) {
  return (
    <TableHead>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        onClick={onClick}
      >
        {label}
        {active ? (
          direction === 'score' || direction === 'submittedAt' ? (
            <ArrowDown className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-50" />
        )}
      </button>
    </TableHead>
  )
}

function StudentTable({
  rows,
  showRank = false,
  showScore = false,
  sort,
  onSortChange,
}: {
  rows: AssignmentRosterRow[]
  showRank?: boolean
  showScore?: boolean
  sort: RosterSort
  onSortChange: (sort: RosterSort) => void
}) {
  if (rows.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="max-h-[480px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              {showRank ? <TableHead className="w-16">Rank</TableHead> : null}
              <SortableHeader
                label="Student"
                active={sort === 'name'}
                direction={sort}
                onClick={() => onSortChange('name')}
              />
              {showScore ? (
                <SortableHeader
                  label="Score"
                  active={sort === 'score'}
                  direction={sort}
                  onClick={() => onSortChange('score')}
                />
              ) : null}
              <TableHead>Status</TableHead>
              <SortableHeader
                label="Submitted"
                active={sort === 'submittedAt'}
                direction={sort}
                onClick={() => onSortChange('submittedAt')}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.studentId} className="h-12">
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
                  <RosterStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(row.submittedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
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
  assignmentId,
  summary,
}: AssignmentStudentsPanelProps) {
  const [activeTab, setActiveTab] = useState<RosterTab>('completed')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<RosterSort>('score')
  const [search, setSearch] = useState('')

  const summaryQuery = useAssignmentRoster(assignmentId, {
    status: 'all',
    page: 1,
    limit: 1,
  })

  const rosterQuery = useAssignmentRoster(assignmentId, {
    status: activeTab,
    page,
    limit: ROSTER_PAGE_SIZE,
    sort,
  })

  const headerStats = summary ?? summaryQuery.data
  const pendingCount = headerStats
    ? Math.max(headerStats.enrolled - headerStats.submitted, 0)
    : 0
  const pagination = rosterQuery.data?.pagination
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1

  const rankings = useMemo(() => {
    const rows = rosterQuery.data?.rankings ?? []
    const query = search.trim().toLowerCase()
    if (!query) return rows

    return rows.filter((row) => {
      const label = formatStudentLabel(row).toLowerCase()
      return label.includes(query) || row.email.toLowerCase().includes(query)
    })
  }, [rosterQuery.data?.rankings, search])

  if (summaryQuery.isLoading && !summary) {
    return <Skeleton className="h-64 w-full" />
  }

  if (rosterQuery.error) {
    return <QueryError error={rosterQuery.error} onRetry={() => rosterQuery.refetch()} />
  }

  if (!headerStats) {
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
        <MetricCard label="Enrolled" value={headerStats.enrolled} />
        <MetricCard label="Completed" value={headerStats.submitted} />
        <MetricCard
          label="Pending"
          value={pendingCount}
          description={`${formatPercent(headerStats.completionRate)} completion rate`}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as RosterTab)
          setPage(1)
          setSort(value === 'completed' ? 'score' : 'name')
        }}
      >
        <TabsList>
          <TabsTrigger value="completed">Completed ({headerStats.submitted})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="all">All ({headerStats.enrolled})</TabsTrigger>
        </TabsList>
      </Tabs>

      {(headerStats.enrolled > 10 || rankings.length > 10) && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students…"
            className="pl-9"
            aria-label="Search students"
          />
        </div>
      )}

      <div className="space-y-4">
        {rosterQuery.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : activeTab === 'completed' ? (
          rankings.length > 0 ? (
            <StudentTable
              rows={rankings}
              showRank
              showScore
              sort={sort}
              onSortChange={(value) => {
                setSort(value)
                setPage(1)
              }}
            />
          ) : (
            <PanelEmpty
              title="No submissions yet"
              description="Students will appear here once they submit this assignment."
            />
          )
        ) : activeTab === 'pending' ? (
          rankings.length > 0 ? (
            <StudentTable
              rows={rankings}
              sort={sort}
              onSortChange={(value) => {
                setSort(value)
                setPage(1)
              }}
            />
          ) : (
            <PanelEmpty
              title="Everyone has submitted"
              description="All enrolled students have completed this assignment."
            />
          )
        ) : rankings.length > 0 ? (
          <StudentTable
            rows={rankings}
            showRank
            showScore
            sort={sort}
            onSortChange={(value) => {
              setSort(value)
              setPage(1)
            }}
          />
        ) : (
          <PanelEmpty
            title="No student roster"
            description="Student details will appear when enrolled students are available."
          />
        )}
      </div>

      {pagination && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages} · {pagination.total} students
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || rosterQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || rosterQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
