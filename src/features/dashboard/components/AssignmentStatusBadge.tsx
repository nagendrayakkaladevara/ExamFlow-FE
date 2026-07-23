import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AssignmentDisplayStatus } from '@/features/assignments/utils'
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

const displayStatusConfig: Record<
  AssignmentDisplayStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-sky-50 text-sky-700',
  },
  open: {
    label: 'Open',
    className: 'bg-emerald-50 text-emerald-600',
  },
  in_progress: {
    label: 'In progress',
    className: 'bg-amber-50 text-amber-700',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-emerald-50 text-emerald-600',
  },
  auto_submitted: {
    label: 'Auto-submitted',
    className: 'bg-muted text-muted-foreground',
  },
  expired: {
    label: 'Expired',
    className: 'bg-rose-50 text-rose-700',
  },
}

export function AssignmentDisplayStatusBadge({ status }: { status: AssignmentDisplayStatus }) {
  const config = displayStatusConfig[status]
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
