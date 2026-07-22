import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QueryError } from '@/components/feedback/EmptyState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { assignmentsApi } from '@/features/assignments/api'
import { isSubmissionCompleted } from '@/features/assignments/utils'
import { queryKeys } from '@/config/query-keys'
import { isApiError } from '@/lib/errors'
import { cn } from '@/lib/utils'

type AnswerMap = Record<string, { selectedOptionIds?: string[]; text?: string } | null>

export function TakeAssignmentPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [endsAt, setEndsAt] = useState<Date | null>(null)
  const [now, setNow] = useState(Date.now())
  const [submitOpen, setSubmitOpen] = useState(false)

  const assignmentQuery = useQuery({
    queryKey: [...queryKeys.assignments.all, id, 'take'],
    queryFn: () => assignmentsApi.get(id),
    enabled: Boolean(id),
  })

  const startedRef = useRef(false)

  const initMutation = useMutation({
    mutationFn: async () => {
      const submission = await assignmentsApi.start(id)
      const attempt = await assignmentsApi.getAttempt(id)
      return { submission, attempt }
    },
    onSuccess: ({ submission, attempt }) => {
      if (isSubmissionCompleted(attempt.submission.status)) {
        navigate(`/student/assignments/${id}/result`)
        return
      }

      setEndsAt(new Date(submission.endsAt))

      const hydrated: AnswerMap = {}
      for (const item of attempt.answers) {
        hydrated[item.assignmentQuestionId] = item.answer
      }
      setAnswers(hydrated)
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
    initMutation.mutate()
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
  const isTimeLow = remainingMs != null && remainingMs <= 5 * 60 * 1000
  const remainingLabel = useMemo(() => {
    if (remainingMs == null) return 'Starting…'
    const totalSeconds = Math.floor(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [remainingMs])

  if (assignmentQuery.isLoading || initMutation.isPending) return <Skeleton className="h-64 w-full" />
  if (assignmentQuery.error) {
    return <QueryError error={assignmentQuery.error} onRetry={() => assignmentQuery.refetch()} />
  }
  if (initMutation.error) {
    return <QueryError error={initMutation.error} onRetry={() => initMutation.mutate()} />
  }
  if (!assignmentQuery.data) return null

  const assignment = assignmentQuery.data

  const unansweredCount = assignment.questions.filter((item) => {
    const answer = answers[item.id]
    if (!answer) return true
    if (item.question.type === 'FILL_BLANK') {
      return !answer.text?.trim()
    }
    return (answer.selectedOptionIds?.length ?? 0) === 0
  }).length

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
          <p
            className={cn(
              'text-2xl font-semibold tabular-nums',
              isTimeLow && 'text-amber-600',
            )}
            aria-live="polite"
          >
            {remainingLabel}
          </p>
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
                <Input
                  value={answers[item.id]?.text ?? ''}
                  onChange={(e) => updateAnswer(item.id, { text: e.target.value })}
                />
              ) : item.question.type === 'SINGLE_CHOICE' ? (
                <RadioGroup
                  value={answers[item.id]?.selectedOptionIds?.[0] ?? ''}
                  onValueChange={(optionId) =>
                    updateAnswer(item.id, { selectedOptionIds: [optionId] })
                  }
                  className="space-y-2"
                >
                  {item.question.options.map((option) => (
                    <Label
                      key={option.id}
                      htmlFor={`${item.id}-${option.id}`}
                      className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 font-normal"
                    >
                      <RadioGroupItem value={option.id} id={`${item.id}-${option.id}`} />
                      <span>{option.optionText}</span>
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {item.question.options.map((option) => {
                    const selected = answers[item.id]?.selectedOptionIds?.includes(option.id)
                    return (
                      <Label
                        key={option.id}
                        htmlFor={`${item.id}-${option.id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 font-normal"
                      >
                        <Checkbox
                          id={`${item.id}-${option.id}`}
                          checked={Boolean(selected)}
                          onCheckedChange={(checked) => {
                            const current = answers[item.id]?.selectedOptionIds ?? []
                            updateAnswer(item.id, {
                              selectedOptionIds: checked
                                ? [...current, option.id]
                                : current.filter((optionId) => optionId !== option.id),
                            })
                          }}
                        />
                        <span>{option.optionText}</span>
                      </Label>
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
          onClick={() => setSubmitOpen(true)}
        >
          Submit assignment
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/student/assignments/${id}`}>Exit</Link>
        </Button>
      </div>

      <AlertDialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              {unansweredCount > 0
                ? `You have ${unansweredCount} unanswered question${unansweredCount === 1 ? '' : 's'}. Submit anyway?`
                : 'You answered every question. Submit your assignment now?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitMutation.isPending}>Keep working</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                submitMutation.mutate(undefined, {
                  onSettled: () => setSubmitOpen(false),
                })
              }}
            >
              Submit assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
