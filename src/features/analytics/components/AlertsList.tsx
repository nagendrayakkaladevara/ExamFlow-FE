import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatPercent } from '@/lib/format'
import type { AdminAlert } from '@/types/domain'

interface AlertsListProps {
  alerts: AdminAlert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No low-completion alerts right now.
      </p>
    )
  }

  return (
    <ul className="divide-y rounded-lg border">
      {alerts.map((alert) => (
        <li
          key={`${alert.classId}-${alert.assignmentId}`}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{alert.assignmentTitle}</p>
            <p className="text-sm text-muted-foreground">
              {alert.className} · {formatPercent(alert.completionRate)} completion (threshold{' '}
              {formatPercent(alert.threshold)})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/classes/${alert.classId}`}>View class</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                to={`/admin/analytics?tab=reports&reportType=assignment-results&classId=${alert.classId}&assignmentId=${alert.assignmentId}`}
              >
                Export results
              </Link>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
