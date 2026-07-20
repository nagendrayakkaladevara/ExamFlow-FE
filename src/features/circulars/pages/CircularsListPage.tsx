import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { circularsApi } from '@/features/circulars/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'

function CircularFeedSkeleton() {
  return (
    <div className="divide-y rounded-lg border">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2 px-6 py-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

export function CircularsListPage() {
  const role = useAuthStore((s) => s.user?.role)
  const basePath = useRoleBasePath()
  const canCreate = role === 'ADMIN' || role === 'LECTURER'

  const query = useQuery({
    queryKey: queryKeys.circulars.all,
    queryFn: async () => {
      const result = await circularsApi.list({ limit: 50 })
      return result.data
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circulars"
        description="Institution announcements and updates."
        actions={
          canCreate ? (
            <Button asChild>
              <Link to={`${basePath}/circulars/new`}>
                <Plus className="size-4" />
                New circular
              </Link>
            </Button>
          ) : undefined
        }
      />

      {query.isLoading ? <CircularFeedSkeleton /> : null}
      {query.error ? <QueryError error={query.error} onRetry={() => query.refetch()} /> : null}

      {query.data?.length === 0 ? (
        <EmptyState title="No circulars yet" description="Announcements will appear here." />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="divide-y rounded-lg border bg-card">
          {query.data.map((circular) => (
            <Link
              key={circular.id}
              to={`${basePath}/circulars/${circular.id}`}
              className="block px-6 py-4 transition-colors hover:bg-muted/40"
            >
              <p className="text-sm font-medium">{circular.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Published {formatDateTime(circular.publishAt)}
              </p>
              {circular.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {circular.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
