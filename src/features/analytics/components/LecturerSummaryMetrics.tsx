import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { AnalyticsMetricPlaceholder } from '@/features/analytics/components/AnalyticsMetricPlaceholder'
import { formatPercent } from '@/lib/format'
import type { LecturerSummary } from '@/types/domain'

interface LecturerSummaryMetricsProps {
  totals?: LecturerSummary['totals']
  isLoading?: boolean
}

export function LecturerSummaryMetrics({ totals, isLoading }: LecturerSummaryMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact />
      </div>
    )
  }

  if (!totals) return null

  const averageScore = totals.averageScore != null ? `${totals.averageScore}%` : '—'

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard
        compact
        className="lg:p-6"
        label="Unique students"
        value={totals.uniqueStudentCount}
        description={`Across ${totals.classCount} ${totals.classCount === 1 ? 'class' : 'classes'}`}
      />
      <MetricCard
        compact
        className="lg:p-6"
        label="Assignments"
        value={totals.assignmentCount}
        description="Published assessments"
      />
      <MetricCard
        compact
        className="lg:p-6"
        label="Submissions"
        value={totals.completedSubmissions}
        description="Completed"
      />
      <MetricCard
        compact
        className="lg:p-6"
        label="Completion"
        value={formatPercent(totals.completionRate)}
        description={totals.averageScore != null ? `Avg score ${averageScore}` : undefined}
      />
    </div>
  )
}
