import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { AnalyticsMetricPlaceholder } from '@/features/analytics/components/AnalyticsMetricPlaceholder'
import { formatPercent } from '@/lib/format'
import type { AdminOverview } from '@/types/domain'

interface AdminSummaryMetricsProps {
  data?: AdminOverview
  isLoading?: boolean
  variant?: 'dashboard' | 'analytics'
}

function AnalyticsOverviewLoading() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
    </div>
  )
}

function DashboardOverviewLoading() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact />
      <AnalyticsMetricPlaceholder compact className="col-span-2 lg:col-span-1" />
    </div>
  )
}

export function AdminSummaryMetrics({
  data,
  isLoading,
  variant = 'dashboard',
}: AdminSummaryMetricsProps) {
  if (isLoading) {
    return variant === 'analytics' ? <AnalyticsOverviewLoading /> : <DashboardOverviewLoading />
  }

  if (!data) return null

  if (variant === 'analytics') {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          compact
          className="lg:p-6"
          label="Students"
          value={data.usersByRole.STUDENT ?? 0}
        />
        <MetricCard
          compact
          className="lg:p-6"
          label="Lecturers"
          value={data.usersByRole.LECTURER ?? 0}
        />
        <MetricCard
          compact
          className="lg:p-6"
          label="Active classes"
          value={data.activeClasses}
        />
        <MetricCard
          compact
          className="lg:p-6"
          label="Assignments"
          value={data.totalAssignments}
        />
        <MetricCard
          compact
          className="lg:p-6"
          label="Completed submissions"
          value={data.completedSubmissions}
        />
        <MetricCard
          compact
          className="lg:p-6"
          label="Average completion"
          value={formatPercent(data.averageCompletionRate)}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard
        compact
        className="lg:p-6"
        label="Students"
        value={data.usersByRole.STUDENT ?? 0}
        description="Enrolled accounts"
      />
      <MetricCard
        compact
        className="lg:p-6"
        label="Lecturers"
        value={data.usersByRole.LECTURER ?? 0}
        description="Teaching staff"
      />
      <MetricCard
        compact
        className="lg:p-6"
        label="Active classes"
        value={data.activeClasses}
        description="Currently running"
      />
      <MetricCard
        compact
        className="lg:p-6"
        label="Assignments"
        value={data.totalAssignments}
        description={`${data.completedSubmissions} submissions`}
      />
      <MetricCard
        compact
        className="col-span-2 lg:col-span-1 lg:p-6"
        label="Average completion"
        value={formatPercent(data.averageCompletionRate)}
        description="Institution-wide"
      />
    </div>
  )
}
