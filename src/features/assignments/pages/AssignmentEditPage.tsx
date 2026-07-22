import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useClassOptions } from '@/hooks/useClassOptions'
import { assignmentsApi } from '@/features/assignments/api'
import {
  getDurationFitError,
  getEndAfterStartError,
  getResultDeclareAtError,
  getStartAtNotInPastError,
} from '@/features/assignments/utils'
import { questionsApi } from '@/features/questions/api'
import { QuestionBankFilterBar } from '@/features/questions/components/QuestionBankFilterBar'
import { QuestionViewDialog } from '@/features/questions/components/QuestionViewDialog'
import { QuestionsDataGrid } from '@/features/questions/components/QuestionsDataGrid'
import { tagsApi } from '@/features/tags/api'
import { queryKeys } from '@/config/query-keys'
import { useDebounce } from '@/hooks/useDebounce'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/format'
import type { ResultPolicy } from '@/types/enums'
import { isApiError } from '@/lib/errors'

const resultPolicyOptions: { value: ResultPolicy; label: string }[] = [
  { value: 'IMMEDIATE', label: 'Immediately after submission' },
  { value: 'AFTER_COMPLETION', label: 'After assignment ends' },
  { value: 'SCHEDULED', label: 'Scheduled date' },
]

function SelectedQuestionsMarks({
  selectedQuestions,
  questions,
  questionMarks,
  onMarksChange,
}: {
  selectedQuestions: string[]
  questions: { id: string; title: string; defaultMarks: number }[]
  questionMarks: Record<string, number>
  onMarksChange: (questionId: string, marks: number) => void
}) {
  if (selectedQuestions.length === 0) return null

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <p className="text-sm font-medium">Marks per question</p>
        <div className="space-y-2">
          {selectedQuestions.map((questionId, index) => {
            const question = questions.find((q) => q.id === questionId)
            return (
              <div key={questionId} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {index + 1}. {question?.title ?? questionId}
                </span>
                <Input
                  type="number"
                  min={0.1}
                  step={0.5}
                  className="w-24"
                  value={questionMarks[questionId] ?? question?.defaultMarks ?? 1}
                  onChange={(e) => onMarksChange(questionId, Number(e.target.value))}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function AssignmentEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { classes } = useClassOptions()
  const [step, setStep] = useState(1)
  const [initialized, setInitialized] = useState(false)

  const [classId, setClassId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [resultPolicy, setResultPolicy] = useState<ResultPolicy>('IMMEDIATE')
  const [resultDeclareAt, setResultDeclareAt] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [questionMarks, setQuestionMarks] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewQuestionId, setViewQuestionId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const assignmentQuery = useQuery({
    queryKey: [...queryKeys.assignments.all, id],
    queryFn: () => assignmentsApi.get(id),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (!assignmentQuery.data || initialized) return
    const assignment = assignmentQuery.data
    setClassId(assignment.classId)
    setTitle(assignment.title)
    setDescription(assignment.description ?? '')
    setStartAt(toDatetimeLocalValue(assignment.startAt))
    setEndAt(toDatetimeLocalValue(assignment.endAt))
    setDurationMinutes(assignment.durationMinutes)
    setResultPolicy(assignment.resultPolicy)
    setResultDeclareAt(
      assignment.resultDeclareAt ? toDatetimeLocalValue(assignment.resultDeclareAt) : '',
    )
    const sorted = [...assignment.questions].sort((a, b) => a.sortOrder - b.sortOrder)
    setSelectedQuestions(sorted.map((q) => q.questionId))
    setQuestionMarks(
      Object.fromEntries(sorted.map((q) => [q.questionId, q.marks])),
    )
    setInitialized(true)
  }, [assignmentQuery.data, initialized])

  const assignmentStarted =
    assignmentQuery.data != null &&
    Date.now() >= new Date(assignmentQuery.data.startAt).getTime()

  const startAtNotInPastError = useMemo(
    () => (assignmentStarted ? null : getStartAtNotInPastError(startAt)),
    [startAt, assignmentStarted],
  )

  const endAfterStartError = useMemo(
    () => getEndAfterStartError(startAt, endAt),
    [startAt, endAt],
  )

  const durationFitError = useMemo(
    () => getDurationFitError(startAt, endAt, durationMinutes),
    [startAt, endAt, durationMinutes],
  )

  const resultDeclareAtError = useMemo(
    () =>
      resultPolicy === 'SCHEDULED'
        ? getResultDeclareAtError(endAt, resultDeclareAt)
        : null,
    [resultPolicy, endAt, resultDeclareAt],
  )

  const isStep1Valid =
    Boolean(classId) &&
    Boolean(title.trim()) &&
    Boolean(endAt) &&
    !startAtNotInPastError &&
    !endAfterStartError &&
    !durationFitError &&
    !resultDeclareAtError

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => tagsApi.list(),
    enabled: step === 2,
  })

  const tagIdsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined

  const questionsQuery = useQuery({
    queryKey: queryKeys.questions.list({
      scope: 'import-edit',
      search: debouncedSearch,
      tags: selectedTags,
    }),
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
    enabled: step === 2,
  })

  const tags = tagsQuery.data ?? []
  const isLoadingQuestions = questionsQuery.isLoading || questionsQuery.isFetching
  const allQuestions = questionsQuery.data ?? []

  function toggleTag(tagId: string) {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((tag) => tag !== tagId)
        : [...current, tagId],
    )
  }

  function removeTag(tagId: string) {
    setSelectedTags((current) => current.filter((tag) => tag !== tagId))
  }

  function handleMarksChange(questionId: string, marks: number) {
    setQuestionMarks((current) => ({ ...current, [questionId]: marks }))
  }

  function handleSelectionChange(next: string[]) {
    setSelectedQuestions(next)
    setQuestionMarks((current) => {
      const updated = { ...current }
      for (const questionId of next) {
        if (updated[questionId] == null) {
          const question = allQuestions.find((q) => q.id === questionId)
          updated[questionId] = question?.defaultMarks ?? 1
        }
      }
      return updated
    })
  }

  const handleViewQuestion = useCallback((questionId: string) => {
    setViewQuestionId(questionId)
  }, [])

  const saveMutation = useMutation({
    mutationFn: async () => {
      await assignmentsApi.update(id, {
        classId,
        title,
        description: description || null,
        startAt: fromDatetimeLocalValue(startAt),
        endAt: fromDatetimeLocalValue(endAt),
        durationMinutes,
        resultPolicy,
        resultDeclareAt:
          resultPolicy === 'SCHEDULED' && resultDeclareAt
            ? fromDatetimeLocalValue(resultDeclareAt)
            : null,
      })

      await assignmentsApi.importQuestions(id, {
        questions: selectedQuestions.map((questionId, index) => ({
          questionId,
          sortOrder: index,
          marks: questionMarks[questionId],
        })),
      })
    },
    onSuccess: () => {
      toast.success('Assignment updated.')
      navigate(`/lecturer/assignments/${id}`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to update assignment.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => assignmentsApi.remove(id),
    onSuccess: () => {
      toast.success('Assignment deleted.')
      navigate('/lecturer/assignments')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to delete assignment.')
    },
    onSettled: () => setDeleteOpen(false),
  })

  if (assignmentQuery.isLoading || !initialized) return <Skeleton className="h-64 w-full" />
  if (assignmentQuery.error) {
    return <QueryError error={assignmentQuery.error} onRetry={() => assignmentQuery.refetch()} />
  }

  return (
    <div className={step === 1 ? 'mx-auto max-w-3xl space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Edit assignment"
        description={step === 1 ? 'Step 1 of 2 — Assignment details' : 'Step 2 of 2 — Update questions'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/lecturer/assignments/${id}`}>Cancel</Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            {step === 2 ? (
              <Button
                type="button"
                disabled={
                  !isStep1Valid ||
                  selectedQuestions.length === 0 ||
                  saveMutation.isPending
                }
                onClick={() => saveMutation.mutate()}
              >
                Save changes
              </Button>
            ) : null}
          </div>
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete assignment?"
        description="This cannot be undone. Students will no longer see this assignment."
        confirmLabel="Delete assignment"
        onConfirm={() => deleteMutation.mutate()}
        pending={deleteMutation.isPending}
      />

      {step === 1 ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1">
              <Label>Class</Label>
              <Select value={classId || undefined} onValueChange={setClassId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}{cls.code ? ` (${cls.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                className="min-h-20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Start</Label>
                  <Input
                    type="datetime-local"
                    min={
                      assignmentStarted
                        ? undefined
                        : toDatetimeLocalValue(new Date().toISOString())
                    }
                    aria-invalid={startAtNotInPastError || endAfterStartError ? true : undefined}
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                  {startAtNotInPastError ? (
                    <p className="text-sm text-destructive">{startAtNotInPastError}</p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <Label>End</Label>
                  <Input
                    type="datetime-local"
                    aria-invalid={endAfterStartError ? true : undefined}
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                  />
                </div>
              </div>
              {endAfterStartError ? (
                <p className="text-sm text-destructive">{endAfterStartError}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  aria-invalid={durationFitError ? true : undefined}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
                {durationFitError ? (
                  <p className="text-sm text-destructive">{durationFitError}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label>Results</Label>
                <Select
                  value={resultPolicy}
                  onValueChange={(value) => setResultPolicy(value as ResultPolicy)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select results policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {resultPolicyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {resultPolicy === 'SCHEDULED' ? (
              <div className="space-y-1">
                <Label>Result declare at</Label>
                <Input
                  type="datetime-local"
                  aria-invalid={resultDeclareAtError ? true : undefined}
                  value={resultDeclareAt}
                  onChange={(e) => setResultDeclareAt(e.target.value)}
                />
                {resultDeclareAtError ? (
                  <p className="text-sm text-destructive">{resultDeclareAtError}</p>
                ) : null}
              </div>
            ) : null}
            <Button type="button" disabled={!isStep1Valid} onClick={() => setStep(2)}>
              Continue to questions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
              title="No questions found"
              description="Try adjusting your search or filters."
            />
          ) : null}

          {questionsQuery.data && questionsQuery.data.length > 0 ? (
            <QuestionsDataGrid
              questions={questionsQuery.data}
              loading={isLoadingQuestions}
              onView={handleViewQuestion}
              selectable
              selectedIds={selectedQuestions}
              onSelectionChange={handleSelectionChange}
            />
          ) : null}

          <SelectedQuestionsMarks
            selectedQuestions={selectedQuestions}
            questions={allQuestions}
            questionMarks={questionMarks}
            onMarksChange={handleMarksChange}
          />

          <QuestionViewDialog
            questionId={viewQuestionId}
            open={Boolean(viewQuestionId)}
            onOpenChange={(open) => {
              if (!open) setViewQuestionId(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
