import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatActivityTimestamp } from '@/features/dashboard/utils'
import type { ActivityFeed } from '@/types/domain'

interface ActivityFeedListProps {
  items: ActivityFeed['items']
  isLoading?: boolean
  nextCursor?: string | null
  onLoadMore?: () => void
  isLoadingMore?: boolean
}

function formatActivityType(type: ActivityFeed['items'][number]['type']) {
  switch (type) {
    case 'ASSIGNMENT_PUBLISHED':
      return 'Assignment published'
    case 'USER_REGISTERED':
      return 'User registered'
    case 'CLASS_CREATED':
      return 'Class created'
    case 'SUBMISSION_COMPLETED':
      return 'Submission completed'
  }
}

export function ActivityFeedList({
  items,
  isLoading,
  nextCursor,
  onLoadMore,
  isLoadingMore,
}: ActivityFeedListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y rounded-lg border">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{item.resourceLabel}</p>
              <p className="text-xs text-muted-foreground">
                {formatActivityType(item.type)}
                {item.actorName ? ` · ${item.actorName}` : ''}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatActivityTimestamp(item.occurredAt)}
            </p>
          </li>
        ))}
      </ul>
      {nextCursor && onLoadMore ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoadingMore}
          onClick={onLoadMore}
        >
          {isLoadingMore ? 'Loading…' : 'Load more'}
        </Button>
      ) : null}
    </div>
  )
}
