import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Loader2, Plus, Tags, X } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { QuestionViewDialog } from '@/features/questions/components/QuestionViewDialog'
import { questionsApi } from '@/features/questions/api'
import { tagsApi } from '@/features/tags/api'
import { queryKeys } from '@/config/query-keys'
import { isApiError } from '@/lib/errors'

export function QuestionsListPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagsOpen, setTagsOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [viewQuestionId, setViewQuestionId] = useState<string | null>(null)

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => tagsApi.list(),
  })

  const tagIdsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined

  const questionsQuery = useQuery({
    queryKey: queryKeys.questions.list({ search, tags: selectedTags }),
    queryFn: async () => {
      const result = search || tagIdsParam
        ? await questionsApi.search({
            q: search || undefined,
            tagIds: tagIdsParam,
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

  const tags = tagsQuery.data ?? []

  function toggleTag(tagId: string) {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
  }

  function removeTag(tagId: string) {
    setSelectedTags((current) => current.filter((id) => id !== tagId))
  }

  const selectedTagRecords = tags.filter((tag) => selectedTags.includes(tag.id))
  const isLoadingQuestions = questionsQuery.isLoading || questionsQuery.isFetching

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

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between sm:w-56">
                <span>
                  {selectedTags.length === 0
                    ? 'Filter by tags'
                    : `${selectedTags.length} tag${selectedTags.length === 1 ? '' : 's'} selected`}
                </span>
                <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tags.length === 0 ? (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">No tags available</p>
              ) : (
                tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => toggleTag(tag.id)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {tag.name}
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedTagRecords.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {selectedTagRecords.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
                {tag.name}
                <button
                  type="button"
                  className="rounded-sm p-0.5 hover:bg-muted"
                  aria-label={`Remove ${tag.name} filter`}
                  onClick={() => removeTag(tag.id)}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={() => setSelectedTags([])}
            >
              Clear all
            </Button>
          </div>
        ) : null}
      </div>

      {questionsQuery.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      {questionsQuery.error ? (
        <QueryError error={questionsQuery.error} onRetry={() => questionsQuery.refetch()} />
      ) : null}

      {questionsQuery.data?.length === 0 && !isLoadingQuestions ? (
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
        <div className="relative rounded-lg border">
          {isLoadingQuestions ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading questions" />
            </div>
          ) : null}
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
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewQuestionId(question.id)}
                      >
                        View
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/lecturer/questions/${question.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <QuestionViewDialog
        questionId={viewQuestionId}
        open={Boolean(viewQuestionId)}
        onOpenChange={(open) => {
          if (!open) setViewQuestionId(null)
        }}
      />

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
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags yet. Add one above.</p>
                ) : (
                  tags.map((tag) => (
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
