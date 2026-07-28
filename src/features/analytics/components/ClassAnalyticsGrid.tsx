import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { AnalyticsMetricPlaceholder } from '@/features/analytics/components/AnalyticsMetricPlaceholder'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { LecturerClassAnalytics } from '@/types/domain'

interface ClassAnalyticsGridProps {
  data?: LecturerClassAnalytics
  isLoading?: boolean
}

function ClassAnalyticsStat({
  label,
  value,
  valueClassName,
  className,
}: {
  label: string
  value: string | number
  valueClassName?: string
  className?: string
}) {
  return (
    <div className={cn('px-4 py-4', className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'mt-1 text-2xl font-semibold tracking-tight tabular-nums',
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function ClassAnalyticsLoading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact />
        <AnalyticsMetricPlaceholder compact />
        <div className="hidden lg:contents">
          <AnalyticsMetricPlaceholder />
          <AnalyticsMetricPlaceholder />
          <AnalyticsMetricPlaceholder />
          <AnalyticsMetricPlaceholder />
        </div>
      </div>
      <div className="rounded-lg border bg-card lg:hidden">
        <div className="border-b px-4 py-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 px-4 py-4">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-7 w-10 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ClassAnalyticsGrid({ data, isLoading }: ClassAnalyticsGridProps) {
  if (isLoading) {
    return <ClassAnalyticsLoading />
  }

  if (!data) return null

  const averageScore =
    data.averageScore != null ? `${data.averageScore}%` : '—'
  const scoreRange =
    data.highestScore != null && data.lowestScore != null
      ? `${data.highestScore}% / ${data.lowestScore}%`
      : '—'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard compact label="Students" value={data.studentCount} className="lg:p-6" />
        <MetricCard compact label="Assignments" value={data.assignmentCount} className="lg:p-6" />
        <MetricCard
          compact
          label="Submissions"
          value={data.completedSubmissions}
          className="lg:p-6"
        />
        <MetricCard
          compact
          label="Completion"
          value={formatPercent(data.completionRate)}
          className="lg:p-6"
        />

        <div className="hidden lg:contents">
          <MetricCard label="Passed" value={data.passed} valueClassName="text-emerald-600" />
          <MetricCard label="Failed" value={data.failed} valueClassName="text-destructive" />
          <MetricCard label="Average score" value={averageScore} />
          <MetricCard label="Highest / lowest" value={scoreRange} />
        </div>
      </div>

      <section className="rounded-lg border bg-card lg:hidden">
        <div className="border-b px-4 py-3">
          <h2 className="text-base font-semibold">Results summary</h2>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-y divide-border">
          <ClassAnalyticsStat label="Passed" value={data.passed} valueClassName="text-emerald-600" />
          <ClassAnalyticsStat label="Failed" value={data.failed} valueClassName="text-destructive" />
          <ClassAnalyticsStat label="Average score" value={averageScore} />
          <ClassAnalyticsStat label="Highest / lowest" value={scoreRange} />
        </dl>
      </section>
    </div>
  )
}
