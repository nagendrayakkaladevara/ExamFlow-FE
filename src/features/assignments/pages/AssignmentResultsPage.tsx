import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/feedback/LoadingSpinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssignmentResultsMetrics } from '@/features/assignments/components/AssignmentResultsMetrics'
import { AssignmentStudentsPanel } from '@/features/assignments/components/AssignmentStudentsPanel'
import { assignmentsApi } from '@/features/assignments/api'
import { analyticsApi } from '@/features/analytics/api'
import { AssignmentExportButton } from '@/features/analytics/components/ExportCsvButton'
import { QuestionBreakdownTable } from '@/features/analytics/components/QuestionBreakdownTable'
import { queryKeys } from '@/config/query-keys'

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
    return <LoadingState minHeightClassName="min-h-64" />
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

      {summaryQuery.isLoading || analytics ? (
        <AssignmentResultsMetrics
          enrolled={analytics?.enrolled ?? 0}
          submitted={analytics?.submitted ?? 0}
          completionRate={analytics?.completionRate ?? 0}
          endAt={assignment.endAt}
          isLoading={summaryQuery.isLoading}
        />
      ) : null}

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
