import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AssignmentTimingStatus } from '@/features/dashboard/utils'

const statusConfig: Record<
  AssignmentTimingStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-muted text-muted-foreground',
  },
  open: {
    label: 'Open',
    className: 'bg-emerald-50 text-emerald-600',
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground',
  },
}

export function AssignmentTimingBadge({ status }: { status: AssignmentTimingStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}

export function SubmissionStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const isSubmitted = normalized.includes('submit') || normalized === 'graded'

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium',
        isSubmitted ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground',
      )}
    >
      {status.replace(/_/g, ' ').toLowerCase()}
    </Badge>
  )
}
