import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { usersApi } from '@/features/users/api'
import { queryKeys } from '@/config/query-keys'
import { ActiveBadge, RoleBadge } from '@/components/shared/StatusBadge'
import { isApiError } from '@/lib/errors'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [newPassword, setNewPassword] = useState('')

  const query = useQuery({
    queryKey: [...queryKeys.users.all, id],
    queryFn: () => usersApi.get(id),
    enabled: Boolean(id),
  })

  const toggleActive = useMutation({
    mutationFn: () =>
      usersApi.update(id, { isActive: !query.data?.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User updated.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to update user.')
    },
  })

  const resetPassword = useMutation({
    mutationFn: () => usersApi.resetPassword(id, newPassword),
    onSuccess: () => {
      setNewPassword('')
      toast.success('Password reset.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to reset password.')
    },
  })

  const removeUser = useMutation({
    mutationFn: () => usersApi.remove(id),
    onSuccess: () => {
      toast.success('User deactivated.')
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to deactivate user.')
    },
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  const user = query.data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
        actions={
          <Button variant="outline" asChild>
            <Link to="/admin/users">Back to users</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <RoleBadge role={user.role} />
              <ActiveBadge active={user.isActive} />
            </div>
            <p>
              <span className="text-muted-foreground">User ID:</span> {user.id}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={toggleActive.isPending || user.role === 'ADMIN'}
              onClick={() => toggleActive.mutate()}
            >
              {user.isActive ? 'Deactivate account' : 'Activate account'}
            </Button>
          </CardContent>
        </Card>

        {user.role !== 'ADMIN' ? (
          <Card>
            <CardHeader>
              <CardTitle>Reset password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                />
              </div>
              <Button
                type="button"
                disabled={newPassword.length < 8 || resetPassword.isPending}
                onClick={() => resetPassword.mutate()}
              >
                Reset password
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {user.role !== 'ADMIN' && user.isActive ? (
        <Button
          type="button"
          variant="destructive"
          disabled={removeUser.isPending}
          onClick={() => removeUser.mutate()}
        >
          Deactivate user
        </Button>
      ) : null}
    </div>
  )
}
