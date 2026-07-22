import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { usersApi } from '@/features/users/api'
import { queryKeys } from '@/config/query-keys'
import { ActiveBadge, RoleBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/format'
import { isApiError } from '@/lib/errors'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [newPassword, setNewPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const query = useQuery({
    queryKey: [...queryKeys.users.all, id],
    queryFn: () => usersApi.get(id),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (!query.data) return
    setFirstName(query.data.firstName)
    setLastName(query.data.lastName)
    setEmail(query.data.email)
  }, [query.data])

  const saveProfile = useMutation({
    mutationFn: () =>
      usersApi.update(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('Profile updated.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to update user.')
    },
  })

  const toggleActive = useMutation({
    mutationFn: () =>
      usersApi.update(id, { isActive: !query.data?.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User updated.')
      setDeactivateOpen(false)
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

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  const user = query.data
  const profileDirty =
    firstName.trim() !== user.firstName ||
    lastName.trim() !== user.lastName ||
    email.trim() !== user.email

  function handleAccountToggle() {
    if (user.isActive) {
      setDeactivateOpen(true)
      return
    }
    toggleActive.mutate()
  }

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
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="button"
              disabled={!profileDirty || saveProfile.isPending}
              onClick={() => saveProfile.mutate()}
            >
              Save profile
            </Button>
          </CardContent>
        </Card>

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
            <p>
              <span className="text-muted-foreground">Last active:</span>{' '}
              {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
            </p>
            <Button
              type="button"
              variant={user.isActive ? 'outline' : 'default'}
              size="sm"
              disabled={toggleActive.isPending || user.role === 'ADMIN'}
              onClick={handleAccountToggle}
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

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate account?"
        description={`${user.firstName} ${user.lastName} will no longer be able to sign in.`}
        confirmLabel="Deactivate account"
        onConfirm={() => toggleActive.mutate()}
        pending={toggleActive.isPending}
      />
    </div>
  )
}
