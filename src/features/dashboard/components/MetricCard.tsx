import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  description?: string
  className?: string
}

export function MetricCard({ label, value, description, className }: MetricCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export function MetricCardLoading() {
  return (
    <div className="flex min-h-[6.5rem] items-center justify-center rounded-lg border bg-card p-6">
      <LoadingSpinner size="sm" />
    </div>
  )
}
