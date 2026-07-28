import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  description?: string
  className?: string
  compact?: boolean
  valueClassName?: string
}

export function MetricCard({
  label,
  value,
  description,
  className,
  compact = false,
  valueClassName,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card',
        compact ? 'p-4' : 'p-6',
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 font-semibold tracking-tight tabular-nums',
          compact ? 'text-2xl' : 'text-3xl',
          valueClassName,
        )}
      >
        {value}
      </p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export function MetricCardLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg border bg-card',
        compact ? 'min-h-[5.5rem] p-4' : 'min-h-[6.5rem] p-6',
      )}
    >
      <LoadingSpinner size="sm" />
    </div>
  )
}
