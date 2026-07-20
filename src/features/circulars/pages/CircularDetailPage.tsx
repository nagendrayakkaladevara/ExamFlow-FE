import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QueryError } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { circularsApi } from '@/features/circulars/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'

function CircularDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-8 rounded-lg border p-6 md:p-8">
        <div className="space-y-4 border-b pb-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function CircularDetailPage() {
  const { id = '' } = useParams()

  const query = useQuery({
    queryKey: [...queryKeys.circulars.all, id],
    queryFn: () => circularsApi.get(id),
    enabled: Boolean(id),
  })

  if (query.isLoading) return <CircularDetailSkeleton />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  const circular = query.data

  return (
    <article className="mx-auto max-w-3xl">
      <div className="rounded-lg border bg-card">
        <div className="space-y-8 p-6 md:p-8">
          <header className="space-y-4 border-b pb-8">
            <p className="text-xs text-muted-foreground">Circular</p>
            <h1 className="text-3xl font-semibold tracking-tight">{circular.title}</h1>
            <p className="text-sm text-muted-foreground">
              Published {formatDateTime(circular.publishAt)}
            </p>
          </header>

          {circular.coverImageUrl ? (
            <img
              src={circular.coverImageUrl}
              alt=""
              className="aspect-[21/9] w-full rounded-md border object-cover"
            />
          ) : null}

          <div className="whitespace-pre-wrap text-base leading-relaxed">
            {circular.description}
          </div>
        </div>
      </div>
    </article>
  )
}
