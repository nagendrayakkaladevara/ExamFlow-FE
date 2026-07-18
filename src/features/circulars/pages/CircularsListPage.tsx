import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { circularsApi } from '@/features/circulars/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'

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

      {query.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {query.error ? <QueryError error={query.error} onRetry={() => query.refetch()} /> : null}

      {query.data?.length === 0 ? (
        <EmptyState title="No circulars yet" description="Announcements will appear here." />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((circular) => (
                <TableRow key={circular.id}>
                  <TableCell className="font-medium">{circular.title}</TableCell>
                  <TableCell>{formatDateTime(circular.publishAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`${basePath}/circulars/${circular.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}
