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
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
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
    className:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300',
  },
  open: {
    label: 'Open',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  in_progress: {
    label: 'In progress',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  },
  submitted: {
    label: 'Submitted',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  auto_submitted: {
    label: 'Auto-submitted',
    className: 'bg-muted text-muted-foreground',
  },
  expired: {
    label: 'Expired',
    className:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
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
        isSubmitted
          ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {status.replace(/_/g, ' ').toLowerCase()}
    </Badge>
  )
}
