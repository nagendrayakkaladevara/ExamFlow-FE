import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { ActiveBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ClassLecturersPanel,
  ClassStudentsPanel,
} from '@/features/classes/components/ClassMembersPanel'
import { classesApi } from '@/features/classes/api'
import { assignmentsApi } from '@/features/assignments/api'
import { analyticsApi } from '@/features/analytics/api'
import { MetricCard, MetricCardSkeleton } from '@/features/dashboard/components/MetricCard'
import { queryKeys } from '@/config/query-keys'
import { formatDate, formatDateTime, formatPercent } from '@/lib/format'
import { isApiError } from '@/lib/errors'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { useClassOptions } from '@/hooks/useClassOptions'
import type { ClassRecord } from '@/types/domain'

function ClassDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

function useClassData(id: string, isAdmin: boolean) {
  const { classes, isLoading: listLoading } = useClassOptions()
  const listClass = classes.find((cls) => cls.id === id)

  const detailQuery = useQuery({
    queryKey: queryKeys.classes.detail(id),
    queryFn: () => classesApi.get(id),
    enabled: Boolean(id) && isAdmin,
  })

  if (isAdmin) {
    return {
      classData: detailQuery.data,
      isLoading: detailQuery.isLoading,
      error: detailQuery.error,
      refetch: detailQuery.refetch,
    }
  }

  return {
    classData: listClass,
    isLoading: listLoading,
    error: listClass ? null : listLoading ? null : new Error('Class not found'),
    refetch: undefined,
  }
}

function ClassEditDialog({
  classData,
  open,
  onOpenChange,
}: {
  classData: ClassRecord
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(classData.name)
  const [code, setCode] = useState(classData.code ?? '')
  const [description, setDescription] = useState(classData.description ?? '')

  const updateMutation = useMutation({
    mutationFn: () =>
      classesApi.update(classData.id, {
        name: name.trim(),
        code: code.trim() || null,
        description: description.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
      toast.success('Class updated.')
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to update class.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit class</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-class-name">Name</Label>
            <Input
              id="edit-class-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-class-code">Code</Label>
            <Input
              id="edit-class-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-class-description">Description</Label>
            <Textarea
              id="edit-class-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            type="button"
            disabled={!name.trim() || updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ClassDetailPage() {
  const role = useAuthStore((s) => s.user?.role)
  const basePath = useRoleBasePath()
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const isAdmin = role === 'ADMIN'
  const isLecturer = role === 'LECTURER'
  const [editOpen, setEditOpen] = useState(false)

  const { classData, isLoading, error, refetch } = useClassData(id, isAdmin)

  const analyticsQuery = useQuery({
    queryKey: queryKeys.analytics.dashboard(`class-${id}`),
    queryFn: () => analyticsApi.lecturerClass(id),
    enabled: Boolean(id) && isLecturer,
  })

  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ classId: id }),
    queryFn: () => assignmentsApi.list(),
    enabled: Boolean(id) && (isLecturer || isAdmin),
    select: (assignments) => assignments.filter((assignment) => assignment.classId === id),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: () => classesApi.update(id, { isActive: !classData?.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
      toast.success(classData?.isActive ? 'Class deactivated.' : 'Class activated.')
      refetch?.()
    },
    onError: (updateError) => {
      toast.error(isApiError(updateError) ? updateError.message : 'Unable to update class.')
    },
  })

  if (isLoading) return <ClassDetailSkeleton />
  if (error) return <QueryError error={error} onRetry={refetch} />
  if (!classData) return null

  const analytics = analyticsQuery.data
  const classAssignments = assignmentsQuery.data ?? []

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title={classData.name}
        description={
          classData.code
            ? `Code: ${classData.code}`
            : classData.description ?? 'Class details and membership'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <>
                <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={toggleActiveMutation.isPending}
                  onClick={() => toggleActiveMutation.mutate()}
                >
                  {classData.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </>
            ) : null}
            <Button variant="outline" asChild>
              <Link to={`${basePath}/classes`}>Back to classes</Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <ActiveBadge active={classData.isActive} />
        {classData.code ? (
          <span className="text-xs text-muted-foreground">Code: {classData.code}</span>
        ) : null}
      </div>

      {isLecturer ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {analyticsQuery.isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <MetricCard
                label="Students"
                value={analytics?.studentCount ?? '—'}
                description="Enrolled in this class"
              />
              <MetricCard
                label="Assignments"
                value={analytics?.assignmentCount ?? '—'}
                description="Created for this class"
              />
              <MetricCard
                label="Submissions"
                value={analytics?.completedSubmissions ?? '—'}
                description={
                  analytics
                    ? `${formatPercent(analytics.completionRate)} completion rate`
                    : undefined
                }
              />
              <MetricCard
                label="Updated"
                value={formatDate(classData.updatedAt)}
                description={`Created ${formatDate(classData.createdAt)}`}
              />
            </>
          )}
        </div>
      ) : null}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lecturers">Lecturers</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          {isLecturer || isAdmin ? (
            <TabsTrigger value="assignments">
              Assignments{classAssignments.length > 0 ? ` (${classAssignments.length})` : ''}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{classData.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Code</p>
                <p className="font-medium">{classData.code ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="mt-1">
                  <ActiveBadge active={classData.isActive} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Last updated</p>
                <p className="font-medium">{formatDateTime(classData.updatedAt)}</p>
              </div>
              {classData.description ? (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Description</p>
                  <p className="mt-1 leading-relaxed text-foreground">{classData.description}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lecturers">
          <ClassLecturersPanel classId={id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="students">
          <ClassStudentsPanel classId={id} isAdmin={isAdmin} />
        </TabsContent>

        {isLecturer || isAdmin ? (
          <TabsContent value="assignments" className="space-y-4">
            {assignmentsQuery.isLoading ? <Skeleton className="h-48 w-full" /> : null}
            {classAssignments.length === 0 && !assignmentsQuery.isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No assignments have been created for this class yet.
                  {isLecturer ? (
                    <>
                      {' '}
                      <Link
                        to="/lecturer/assignments/new"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Create an assignment
                      </Link>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
            {classAssignments.length > 0 ? (
              <div className="rounded-lg border">
                <div className="divide-y">
                  {classAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(assignment.startAt)} – {formatDateTime(assignment.endAt)}
                        </p>
                      </div>
                      {isLecturer ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/lecturer/assignments/${assignment.id}`}>View</Link>
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </TabsContent>
        ) : null}
      </Tabs>

      {isAdmin ? (
        <ClassEditDialog
          classData={classData}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </div>
  )
}
