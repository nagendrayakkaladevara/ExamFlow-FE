import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssignmentStudentsPanel } from '@/features/assignments/components/AssignmentStudentsPanel'
import { assignmentsApi } from '@/features/assignments/api'
import { analyticsApi } from '@/features/analytics/api'
import { AssignmentExportButton } from '@/features/analytics/components/ExportCsvButton'
import { QuestionBreakdownTable } from '@/features/analytics/components/QuestionBreakdownTable'
import { MetricCard, MetricCardSkeleton } from '@/features/dashboard/components/MetricCard'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime, formatPercent } from '@/lib/format'

export function AssignmentResultsPage() {
  const { id = '' } = useParams()

  const assignmentQuery = useQuery({
    queryKey: [...queryKeys.assignments.all, id],
    queryFn: () => assignmentsApi.get(id),
    enabled: Boolean(id),
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.analytics.lecturerAssignment(id, { status: 'all', limit: 1 }),
    queryFn: () => analyticsApi.lecturerAssignment(id, { status: 'all', limit: 1 }),
    enabled: Boolean(id),
  })

  if (assignmentQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (assignmentQuery.error) {
    return <QueryError error={assignmentQuery.error} onRetry={() => assignmentQuery.refetch()} />
  }

  if (!assignmentQuery.data) return null

  const assignment = assignmentQuery.data
  const analytics = summaryQuery.data

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Assignment results"
        description={assignment.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <AssignmentExportButton assignmentId={id} title={assignment.title} />
            <Button variant="outline" asChild>
              <Link to={`/lecturer/assignments/${id}`}>Back to assignment</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryQuery.isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : analytics ? (
          <>
            <MetricCard label="Enrolled" value={analytics.enrolled} />
            <MetricCard label="Submitted" value={analytics.submitted} />
            <MetricCard
              label="Completion"
              value={formatPercent(analytics.completionRate)}
            />
            <MetricCard
              label="Closes"
              value={formatDateTime(assignment.endAt)}
              description="Assignment deadline"
            />
          </>
        ) : null}
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">Student roster</TabsTrigger>
          <TabsTrigger value="questions">Question analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <AssignmentStudentsPanel
            assignmentId={id}
            summary={
              analytics
                ? {
                    enrolled: analytics.enrolled,
                    submitted: analytics.submitted,
                    completionRate: analytics.completionRate,
                  }
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="questions">
          <QuestionBreakdownTable assignmentId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
