import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { circularsApi } from '@/features/circulars/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { useRoleBasePath } from '@/hooks/useRolePath'

export function CircularDetailPage() {
  const { id = '' } = useParams()
  const basePath = useRoleBasePath()

  const query = useQuery({
    queryKey: [...queryKeys.circulars.all, id],
    queryFn: () => circularsApi.get(id),
    enabled: Boolean(id),
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  const circular = query.data

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={circular.title}
        description={`Published ${formatDateTime(circular.publishAt)}`}
        actions={
          <Button variant="outline" asChild>
            <Link to={`${basePath}/circulars`}>Back</Link>
          </Button>
        }
      />
      {circular.coverImageUrl ? (
        <img src={circular.coverImageUrl} alt="" className="w-full rounded-lg border" />
      ) : null}
      <Card>
        <CardContent className="pt-6 whitespace-pre-wrap text-sm leading-relaxed">
          {circular.description}
        </CardContent>
      </Card>
    </div>
  )
}
