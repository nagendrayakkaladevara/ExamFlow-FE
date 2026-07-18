import { useState } from 'react'
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
import { usersApi } from '@/features/users/api'
import { queryKeys } from '@/config/query-keys'
import { ActiveBadge, RoleBadge } from '@/components/shared/StatusBadge'

export function UsersListPage() {
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'LECTURER' | 'STUDENT'>('ALL')

  const query = useQuery({
    queryKey: queryKeys.users.list({ role: roleFilter }),
    queryFn: async () => {
      const result = await usersApi.list({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        limit: 50,
      })
      return result.data
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Create and manage lecturer and student accounts."
        actions={
          <Button asChild>
            <Link to="/admin/users/new">
              <Plus className="size-4" />
              Add user
            </Link>
          </Button>
        }
      />

      <div className="flex gap-2">
        {(['ALL', 'LECTURER', 'STUDENT'] as const).map((role) => (
          <Button
            key={role}
            type="button"
            size="sm"
            variant={roleFilter === role ? 'default' : 'outline'}
            onClick={() => setRoleFilter(role)}
          >
            {role === 'ALL' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
          </Button>
        ))}
      </div>

      {query.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {query.error ? <QueryError error={query.error} onRetry={() => query.refetch()} /> : null}

      {query.data?.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Add lecturers and students to get started."
          action={
            <Button asChild>
              <Link to="/admin/users/new">Add user</Link>
            </Button>
          }
        />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <ActiveBadge active={user.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/admin/users/${user.id}`}>View</Link>
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
