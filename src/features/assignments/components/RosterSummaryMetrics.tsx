import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { AnalyticsMetricPlaceholder } from '@/features/analytics/components/AnalyticsMetricPlaceholder'
import { formatPercent } from '@/lib/format'

interface RosterSummaryMetricsProps {
  enrolled: number
  submitted: number
  completionRate: number
  isLoading?: boolean
}

export function RosterSummaryMetrics({
  enrolled,
  submitted,
  completionRate,
  isLoading = false,
}: RosterSummaryMetricsProps) {
  const pending = Math.max(enrolled - submitted, 0)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact className="col-span-2 lg:col-span-1" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <MetricCard compact className="lg:p-6" label="Enrolled" value={enrolled} />
      <MetricCard compact className="lg:p-6" label="Completed" value={submitted} />
      <MetricCard
        compact
        className="col-span-2 lg:col-span-1 lg:p-6"
        label="Pending"
        value={pending}
        description={`${formatPercent(completionRate)} completion rate`}
      />
    </div>
  )
}
