import { MetricCard, MetricCardSkeleton } from '@/features/dashboard/components/MetricCard'
import { formatPercent } from '@/lib/format'
import type { LecturerClassAnalytics } from '@/types/domain'

interface ClassAnalyticsGridProps {
  data?: LecturerClassAnalytics
  isLoading?: boolean
}

export function ClassAnalyticsGrid({ data, isLoading }: ClassAnalyticsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard label="Students" value={data.studentCount} />
      <MetricCard label="Assignments" value={data.assignmentCount} />
      <MetricCard label="Submissions" value={data.completedSubmissions} />
      <MetricCard label="Completion" value={formatPercent(data.completionRate)} />
      <MetricCard label="Passed" value={data.passed} />
      <MetricCard label="Failed" value={data.failed} />
      <MetricCard
        label="Average score"
        value={data.averageScore != null ? `${data.averageScore}%` : '—'}
      />
      <MetricCard
        label="Highest / lowest"
        value={
          data.highestScore != null && data.lowestScore != null
            ? `${data.highestScore}% / ${data.lowestScore}%`
            : '—'
        }
      />
    </div>
  )
}
