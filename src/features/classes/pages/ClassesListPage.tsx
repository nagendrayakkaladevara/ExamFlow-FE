import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { classesApi } from '@/features/classes/api'
import { queryKeys } from '@/config/query-keys'
import { ActiveBadge } from '@/components/shared/StatusBadge'
import { isApiError } from '@/lib/errors'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { useClassOptions } from '@/hooks/useClassOptions'

export function ClassesListPage() {
  const role = useAuthStore((s) => s.user?.role)
  const basePath = useRoleBasePath()
  const isAdmin = role === 'ADMIN'

  if (isAdmin) {
    return <AdminClassesList basePath={basePath} />
  }

  return <RoleClassesList basePath={basePath} />
}

function RoleClassesList({ basePath }: { basePath: string }) {
  const { classes, isLoading, error } = useClassOptions()

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (error) return <QueryError error={error} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="View your assigned classes."
      />

      {classes.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="You are not assigned to any classes yet."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.code ?? '—'}</TableCell>
                  <TableCell>
                    <ActiveBadge active={cls.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`${basePath}/classes/${cls.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function AdminClassesList({ basePath }: { basePath: string }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const query = useQuery({
    queryKey: queryKeys.classes.list({ scope: 'admin' }),
    queryFn: async () => {
      const result = await classesApi.list({ isActive: true, limit: 100 })
      return result.data
    },
  })

  const createMutation = useMutation({
    mutationFn: () => classesApi.create({ name, code: code || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
      setOpen(false)
      setName('')
      setCode('')
      toast.success('Class created.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to create class.')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Create classes and assign lecturers and students."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" />
                Add class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="class-name">Name</Label>
                  <Input id="class-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="class-code">Code (optional)</Label>
                  <Input id="class-code" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <Button
                  type="button"
                  disabled={!name.trim() || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {query.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {query.error ? <QueryError error={query.error} onRetry={() => query.refetch()} /> : null}

      {query.data?.length === 0 ? (
        <EmptyState title="No classes yet" description="Create your first class to get started." />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.code ?? '—'}</TableCell>
                  <TableCell>
                    <ActiveBadge active={cls.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`${basePath}/classes/${cls.id}`}>Manage</Link>
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
