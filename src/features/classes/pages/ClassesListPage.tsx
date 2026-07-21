import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Plus } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ClassesDataGrid } from '@/features/classes/components/ClassesDataGrid'
import { classesApi } from '@/features/classes/api'
import { queryKeys } from '@/config/query-keys'
import { useDebounce } from '@/hooks/useDebounce'
import { isApiError } from '@/lib/errors'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { useClassOptions } from '@/hooks/useClassOptions'
import type { ClassRecord } from '@/types/domain'

type StatusFilter = 'all' | 'active' | 'inactive'

function filterClasses(
  classes: ClassRecord[],
  search: string,
  statusFilter: StatusFilter,
): ClassRecord[] {
  const normalizedSearch = search.trim().toLowerCase()

  return classes.filter((cls) => {
    const matchesSearch =
      !normalizedSearch ||
      cls.name.toLowerCase().includes(normalizedSearch) ||
      (cls.code?.toLowerCase().includes(normalizedSearch) ?? false)

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && cls.isActive) ||
      (statusFilter === 'inactive' && !cls.isActive)

    return matchesSearch && matchesStatus
  })
}

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
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const { classes, isLoading, error } = useClassOptions()

  const filteredClasses = useMemo(
    () => filterClasses(classes, debouncedSearch, 'active'),
    [classes, debouncedSearch],
  )

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (error) return <QueryError error={error} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="View your assigned classes."
      />

      <Input
        placeholder="Search by name or code…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filteredClasses.length === 0 ? (
        <EmptyState
          title={classes.length === 0 ? 'No classes yet' : 'No classes match your search'}
          description={
            classes.length === 0
              ? 'You are not assigned to any classes yet.'
              : 'Try a different search term.'
          }
        />
      ) : (
        <ClassesDataGrid
          classes={filteredClasses}
          loading={isLoading}
          basePath={basePath}
        />
      )}
    </div>
  )
}

function AdminClassesList({ basePath }: { basePath: string }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const query = useQuery({
    queryKey: queryKeys.classes.list({ scope: 'admin' }),
    queryFn: async () => {
      const result = await classesApi.list({ limit: 100 })
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

  const filteredClasses = useMemo(
    () => filterClasses(query.data ?? [], debouncedSearch, statusFilter),
    [query.data, debouncedSearch, statusFilter],
  )

  const isLoading = query.isLoading || query.isFetching

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between sm:w-44">
              <span>
                {statusFilter === 'all'
                  ? 'All statuses'
                  : statusFilter === 'active'
                    ? 'Active only'
                    : 'Inactive only'}
              </span>
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter === 'all'}
              onCheckedChange={() => setStatusFilter('all')}
              onSelect={(event) => event.preventDefault()}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === 'active'}
              onCheckedChange={() => setStatusFilter('active')}
              onSelect={(event) => event.preventDefault()}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === 'inactive'}
              onCheckedChange={() => setStatusFilter('inactive')}
              onSelect={(event) => event.preventDefault()}
            >
              Inactive
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {query.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {query.error ? <QueryError error={query.error} onRetry={() => query.refetch()} /> : null}

      {filteredClasses.length === 0 && !isLoading ? (
        <EmptyState
          title={query.data?.length === 0 ? 'No classes yet' : 'No classes match your filters'}
          description={
            query.data?.length === 0
              ? 'Create your first class to get started.'
              : 'Try adjusting your search or status filter.'
          }
        />
      ) : null}

      {filteredClasses.length > 0 ? (
        <ClassesDataGrid classes={filteredClasses} loading={isLoading} basePath={basePath} />
      ) : null}
    </div>
  )
}
