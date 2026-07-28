import { isPast, parseISO } from 'date-fns'
import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { AnalyticsMetricPlaceholder } from '@/features/analytics/components/AnalyticsMetricPlaceholder'
import { formatDateTime, formatPercent } from '@/lib/format'

interface AssignmentResultsMetricsProps {
  enrolled: number
  submitted: number
  completionRate: number
  endAt: string
  isLoading?: boolean
}

function DeadlineMetric({
  endAt,
  compact = false,
  className,
}: {
  endAt: string
  compact?: boolean
  className?: string
}) {
  const isClosed = isPast(parseISO(endAt))

  return (
    <MetricCard
      compact={compact}
      className={className}
      label={isClosed ? 'Closed' : 'Closes'}
      value={formatDateTime(endAt)}
      description={isClosed ? 'Assignment deadline passed' : 'Assignment deadline'}
      valueClassName="text-base leading-snug sm:text-2xl lg:text-3xl"
    />
  )
}

export function AssignmentResultsMetrics({
  enrolled,
  submitted,
  completionRate,
  endAt,
  isLoading = false,
}: AssignmentResultsMetricsProps) {
  if (isLoading) {
    return (
      <>
        <div className="space-y-4 lg:hidden">
          <div className="grid grid-cols-2 gap-4">
            <AnalyticsMetricPlaceholder compact />
            <AnalyticsMetricPlaceholder compact />
          </div>
          <AnalyticsMetricPlaceholder compact />
          <AnalyticsMetricPlaceholder compact />
        </div>
        <div className="hidden gap-4 lg:grid lg:grid-cols-4">
          <AnalyticsMetricPlaceholder compact />
          <AnalyticsMetricPlaceholder compact />
          <AnalyticsMetricPlaceholder compact />
          <AnalyticsMetricPlaceholder compact />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-4 lg:hidden">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard compact label="Enrolled" value={enrolled} />
          <MetricCard compact label="Submitted" value={submitted} />
        </div>
        <MetricCard compact label="Completion" value={formatPercent(completionRate)} />
        <DeadlineMetric endAt={endAt} compact />
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        <MetricCard compact className="lg:p-6" label="Enrolled" value={enrolled} />
        <MetricCard compact className="lg:p-6" label="Submitted" value={submitted} />
        <MetricCard
          compact
          className="lg:p-6"
          label="Completion"
          value={formatPercent(completionRate)}
        />
        <DeadlineMetric endAt={endAt} compact className="lg:p-6" />
      </div>
    </>
  )
}
