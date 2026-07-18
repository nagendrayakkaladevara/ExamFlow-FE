import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { assignmentsApi } from '@/features/assignments/api'
import { queryKeys } from '@/config/query-keys'
import { isApiError } from '@/lib/errors'

type AnswerMap = Record<string, { selectedOptionIds?: string[]; text?: string } | null>

export function TakeAssignmentPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [endsAt, setEndsAt] = useState<Date | null>(null)
  const [now, setNow] = useState(Date.now())

  const assignmentQuery = useQuery({
    queryKey: [...queryKeys.assignments.all, id, 'take'],
    queryFn: () => assignmentsApi.get(id),
    enabled: Boolean(id),
  })

  const startedRef = useRef(false)

  const startMutation = useMutation({
    mutationFn: () => assignmentsApi.start(id),
    onSuccess: (submission) => {
      setEndsAt(new Date(submission.endsAt))
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to start assignment.')
    },
  })

  const autosaveMutation = useMutation({
    mutationFn: (payload: AnswerMap) =>
      assignmentsApi.autosave(id, {
        answers: Object.entries(payload).map(([assignmentQuestionId, answer]) => ({
          assignmentQuestionId,
          answer,
        })),
      }),
  })

  const submitMutation = useMutation({
    mutationFn: () => assignmentsApi.submit(id),
    onSuccess: () => {
      toast.success('Assignment submitted.')
      navigate(`/student/assignments/${id}/result`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to submit assignment.')
    },
  })

  useEffect(() => {
    if (!id || startedRef.current) return
    startedRef.current = true
    startMutation.mutate()
  }, [id])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!endsAt) return
    if (now >= endsAt.getTime() && !submitMutation.isPending && !submitMutation.isSuccess) {
      submitMutation.mutate()
    }
  }, [now, endsAt])

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  useEffect(() => {
    if (Object.keys(answers).length === 0) return
    const timeout = window.setTimeout(() => autosaveMutation.mutate(answers), 1500)
    return () => window.clearTimeout(timeout)
  }, [answers])

  const remainingMs = endsAt ? Math.max(0, endsAt.getTime() - now) : null
  const remainingLabel = useMemo(() => {
    if (remainingMs == null) return 'Starting…'
    const totalSeconds = Math.floor(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [remainingMs])

  if (assignmentQuery.isLoading) return <Skeleton className="h-64 w-full" />
  if (assignmentQuery.error) {
    return <QueryError error={assignmentQuery.error} onRetry={() => assignmentQuery.refetch()} />
  }
  if (!assignmentQuery.data) return null

  const assignment = assignmentQuery.data

  function updateAnswer(assignmentQuestionId: string, answer: AnswerMap[string]) {
    setAnswers((prev) => ({ ...prev, [assignmentQuestionId]: answer }))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-background/95 p-4 backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold">{assignment.title}</h1>
          <p className="text-sm text-muted-foreground">
            {autosaveMutation.isPending ? 'Saving…' : 'All changes saved'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Time left</p>
          <p className="text-2xl font-semibold tabular-nums">{remainingLabel}</p>
        </div>
      </div>

      <div className="space-y-4">
        {assignment.questions.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="space-y-3 pt-6">
              <p className="font-medium">
                {index + 1}. {item.question.title}
              </p>
              <p className="text-sm text-muted-foreground">{item.question.description}</p>
              {item.question.imageUrl ? (
                <img src={item.question.imageUrl} alt="" className="max-h-48 rounded-md border" />
              ) : null}

              {item.question.type === 'FILL_BLANK' ? (
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={answers[item.id]?.text ?? ''}
                  onChange={(e) => updateAnswer(item.id, { text: e.target.value })}
                />
              ) : (
                <div className="space-y-2">
                  {item.question.options.map((option) => {
                    const selected = answers[item.id]?.selectedOptionIds?.includes(option.id)
                    return (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2"
                      >
                        <input
                          type={item.question.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                          checked={Boolean(selected)}
                          onChange={() => {
                            if (item.question.type === 'SINGLE_CHOICE') {
                              updateAnswer(item.id, { selectedOptionIds: [option.id] })
                            } else {
                              const current = answers[item.id]?.selectedOptionIds ?? []
                              updateAnswer(item.id, {
                                selectedOptionIds: selected
                                  ? current.filter((id) => id !== option.id)
                                  : [...current, option.id],
                              })
                            }
                          }}
                        />
                        <span>{option.optionText}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          disabled={submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
        >
          Submit assignment
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/student/assignments/${id}`}>Exit</Link>
        </Button>
      </div>
    </div>
  )
}
