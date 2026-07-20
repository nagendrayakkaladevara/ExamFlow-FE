import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { classesApi } from '@/features/classes/api'
import { usersApi } from '@/features/users/api'
import { queryKeys } from '@/config/query-keys'
import { ActiveBadge } from '@/components/shared/StatusBadge'
import { isApiError } from '@/lib/errors'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'

export function ClassDetailPage() {
  const role = useAuthStore((s) => s.user?.role)
  const basePath = useRoleBasePath()
  const { id = '' } = useParams()
  const [lecturerId, setLecturerId] = useState('')
  const [studentId, setStudentId] = useState('')
  const isAdmin = role === 'ADMIN'

  const query = useQuery({
    queryKey: [...queryKeys.classes.all, id],
    queryFn: () => classesApi.get(id),
    enabled: Boolean(id),
  })

  const lecturersQuery = useQuery({
    queryKey: queryKeys.users.list({ role: 'LECTURER' }),
    queryFn: async () => {
      const result = await usersApi.list({ role: 'LECTURER', isActive: true, limit: 100 })
      return result.data
    },
    enabled: isAdmin,
  })

  const studentsQuery = useQuery({
    queryKey: queryKeys.users.list({ role: 'STUDENT' }),
    queryFn: async () => {
      const result = await usersApi.list({ role: 'STUDENT', isActive: true, limit: 100 })
      return result.data
    },
    enabled: isAdmin,
  })

  const assignLecturer = useMutation({
    mutationFn: () => classesApi.assignLecturer(id, lecturerId),
    onSuccess: () => {
      setLecturerId('')
      toast.success('Lecturer assigned.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to assign lecturer.')
    },
  })

  const enrollStudent = useMutation({
    mutationFn: () => classesApi.enrollStudent(id, studentId),
    onSuccess: () => {
      setStudentId('')
      toast.success('Student enrolled.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to enroll student.')
    },
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  const cls = query.data

  return (
    <div className="space-y-6">
      <PageHeader
        title={cls.name}
        description={cls.code ? `Code: ${cls.code}` : cls.description ?? undefined}
        actions={
          <Button variant="outline" asChild>
            <Link to={`${basePath}/classes`}>Back to classes</Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <ActiveBadge active={cls.isActive} />
      </div>

      {cls.description ? (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{cls.description}</p>
          </CardContent>
        </Card>
      ) : null}

      {isAdmin ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Assign lecturer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="lecturer">Lecturer</Label>
                <select
                  id="lecturer"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={lecturerId}
                  onChange={(e) => setLecturerId(e.target.value)}
                >
                  <option value="">Select lecturer</option>
                  {(lecturersQuery.data ?? []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                disabled={!lecturerId || assignLecturer.isPending}
                onClick={() => assignLecturer.mutate()}
              >
                Assign lecturer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enroll student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="student">Student</Label>
                <select
                  id="student"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  <option value="">Select student</option>
                  {(studentsQuery.data ?? []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                disabled={!studentId || enrollStudent.isPending}
                onClick={() => enrollStudent.mutate()}
              >
                Enroll student
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
