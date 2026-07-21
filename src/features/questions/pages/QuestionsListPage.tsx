import { useCallback, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { QuestionBankFilterBar } from '@/features/questions/components/QuestionBankFilterBar'
import { QuestionViewDialog } from '@/features/questions/components/QuestionViewDialog'
import { QuestionsDataGrid } from '@/features/questions/components/QuestionsDataGrid'
import { questionsApi } from '@/features/questions/api'
import { tagsApi } from '@/features/tags/api'
import { queryKeys } from '@/config/query-keys'
import { isApiError } from '@/lib/errors'

export function QuestionsListPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
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
    queryKey: queryKeys.questions.list({ search: debouncedSearch, tags: selectedTags }),
    queryFn: async () => {
      const result = debouncedSearch || tagIdsParam
        ? await questionsApi.search({
            q: debouncedSearch || undefined,
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

  const isLoadingQuestions = questionsQuery.isLoading || questionsQuery.isFetching

  const handleViewQuestion = useCallback((questionId: string) => {
    setViewQuestionId(questionId)
  }, [])

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

      <QuestionBankFilterBar
        search={search}
        onSearchChange={setSearch}
        tags={tags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onRemoveTag={removeTag}
        onClearTags={() => setSelectedTags([])}
      />

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
        <QuestionsDataGrid
          questions={questionsQuery.data}
          loading={isLoadingQuestions}
          onView={handleViewQuestion}
        />
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
