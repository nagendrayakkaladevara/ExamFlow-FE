import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { questionsApi } from '@/features/questions/api'
import { tagsApi } from '@/features/tags/api'
import { queryKeys } from '@/config/query-keys'
import { isApiError } from '@/lib/errors'

export function QuestionsListPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => tagsApi.list(),
  })

  const questionsQuery = useQuery({
    queryKey: queryKeys.questions.list({ search, tag: selectedTag }),
    queryFn: async () => {
      const result = search || selectedTag
        ? await questionsApi.search({
            q: search || undefined,
            tagIds: selectedTag ?? undefined,
            limit: 50,
          })
        : await questionsApi.list({ limit: 50 })
      return result.data
    },
  })

  const createTag = useMutation({
    mutationFn: () => tagsApi.create(newTagName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
      setNewTagName('')
      toast.success('Tag created.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to create tag.')
    },
  })

  const deleteTag = useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
      toast.success('Tag removed.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to remove tag.')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Create reusable questions and organize them with tags."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setTagsOpen(true)}
            >
              <Tags className="size-4" />
              Manage tags
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/lecturer/questions/new">
                <Plus className="size-4" />
                Add question
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={selectedTag === null ? 'default' : 'outline'}
            onClick={() => setSelectedTag(null)}
          >
            All
          </Button>
          {(tagsQuery.data ?? []).map((tag) => (
            <Button
              key={tag.id}
              type="button"
              size="sm"
              variant={selectedTag === tag.id ? 'default' : 'outline'}
              onClick={() => setSelectedTag(tag.id)}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      {questionsQuery.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {questionsQuery.error ? (
        <QueryError error={questionsQuery.error} onRetry={() => questionsQuery.refetch()} />
      ) : null}

      {questionsQuery.data?.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Add your first question to start building assignments."
          action={
            <Button asChild>
              <Link to="/lecturer/questions/new">Add question</Link>
            </Button>
          }
        />
      ) : null}

      {questionsQuery.data && questionsQuery.data.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionsQuery.data.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">{question.title}</TableCell>
                  <TableCell>{question.type.replace('_', ' ').toLowerCase()}</TableCell>
                  <TableCell>{question.difficulty.toLowerCase()}</TableCell>
                  <TableCell>{question.defaultMarks}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(question.tags ?? []).map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/lecturer/questions/${question.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <Dialog open={tagsOpen} onOpenChange={setTagsOpen}>
        <DialogContent className="flex max-h-[min(32rem,calc(100svh-2rem))] min-h-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
            <DialogTitle>Manage tags</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4 sm:px-6">
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Input
                placeholder="New tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="min-w-0"
              />
              <Button
                type="button"
                className="w-full shrink-0 sm:w-auto"
                disabled={!newTagName.trim() || createTag.isPending}
                onClick={() => createTag.mutate()}
              >
                Add
              </Button>
            </div>
            <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="space-y-2 pr-1">
                {(tagsQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags yet. Add one above.</p>
                ) : (
                  (tagsQuery.data ?? []).map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                    >
                      <span className="min-w-0 truncate">{tag.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => deleteTag.mutate(tag.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
