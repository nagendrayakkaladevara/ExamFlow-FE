import { Badge } from '@/components/ui/badge'
import { getRosterStatusLabel } from '@/features/analytics/utils/roster-status'
import { cn } from '@/lib/utils'
import type { AssignmentRosterSubmissionStatus } from '@/types/domain'

const rosterStatusStyles: Record<
  ReturnType<typeof getRosterStatusLabel>,
  string
> = {
  Completed:
    'border-transparent bg-emerald-50 font-medium text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
  'In progress':
    'border-transparent bg-amber-50 font-medium text-amber-600 dark:bg-amber-950/60 dark:text-amber-300',
  'Not started': 'bg-muted font-medium text-muted-foreground',
}

export function RosterStatusBadge({ status }: { status: AssignmentRosterSubmissionStatus }) {
  const label = getRosterStatusLabel(status)

  return (
    <Badge variant="secondary" className={cn(rosterStatusStyles[label])}>
      {label}
    </Badge>
  )
}
