import { cn } from '@/lib/utils'

export function AnalyticsMetricPlaceholder({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg border bg-card',
        compact ? 'min-h-[5.5rem] p-4' : 'min-h-[6.5rem] p-6',
        className,
      )}
    >
      <div className="h-4 w-20 rounded bg-muted" />
      <div className={cn('mt-3 rounded bg-muted', compact ? 'h-7 w-12' : 'h-8 w-16')} />
    </div>
  )
}
