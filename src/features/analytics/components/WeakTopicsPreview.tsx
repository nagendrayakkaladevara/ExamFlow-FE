import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardPanel } from '@/features/dashboard/components/DashboardPanel'
import { formatPercent } from '@/lib/format'
import type { StudentTagAnalytics } from '@/types/domain'

interface WeakTopicsPreviewProps {
  data?: StudentTagAnalytics
  isLoading?: boolean
  analyticsHref: string
}

export function WeakTopicsPreview({ data, isLoading, analyticsHref }: WeakTopicsPreviewProps) {
  return (
    <DashboardPanel
      title="Areas to improve"
      description="Topics where you may need more practice"
      viewAllHref={analyticsHref}
      viewAllLabel="View performance"
    >
      {isLoading ? (
        <div className="space-y-3 py-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (data?.weakTopics.length ?? 0) > 0 ? (
        <div className="divide-y">
          {data!.weakTopics.slice(0, 3).map((topic) => (
            <div key={topic.tagId} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">{topic.tagName}</p>
                <p className="text-xs text-muted-foreground">
                  {topic.correctCount} of {topic.attemptCount} correct
                </p>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">
                {topic.correctRate != null ? formatPercent(topic.correctRate) : '—'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No weak topics identified yet. Complete more assignments to see insights.
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link to={analyticsHref}>View performance</Link>
          </Button>
        </div>
      )}
    </DashboardPanel>
  )
}
