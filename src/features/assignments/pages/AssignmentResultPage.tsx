import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { assignmentsApi } from '@/features/assignments/api'
import { formatQuestionType } from '@/features/assignments/utils'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { isApiError } from '@/lib/errors'
import { cn } from '@/lib/utils'
import type { AssignmentResult } from '@/types/domain'

type AnswerPayload = {
  selectedOptionIds?: string[]
  text?: string
}

function parseAnswer(answer: Record<string, unknown> | null): AnswerPayload {
  if (!answer) return {}
  return {
    selectedOptionIds: Array.isArray(answer.selectedOptionIds)
      ? (answer.selectedOptionIds as string[])
      : undefined,
    text: typeof answer.text === 'string' ? answer.text : undefined,
  }
}

function AnswerReviewCard({
  answer,
  index,
}: {
  answer: AssignmentResult['answers'][number]
  index: number
}) {
  const parsed = parseAnswer(answer.answer)
  const selectedIds = new Set(parsed.selectedOptionIds ?? [])

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-medium">
              {index + 1}. {answer.title}
            </p>
            {answer.description ? (
              <p className="text-sm text-muted-foreground">{answer.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                answer.isCorrect
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-destructive/30 bg-destructive/5 text-destructive',
              )}
            >
              {answer.isCorrect ? 'Correct' : 'Incorrect'}
            </Badge>
            <span className="text-sm tabular-nums text-muted-foreground">
              {answer.marksAwarded} marks
            </span>
          </div>
        </div>

        {answer.imageUrl ? (
          <img src={answer.imageUrl} alt="" className="max-h-48 rounded-md border" />
        ) : null}

        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatQuestionType(answer.type)}
        </p>

        {answer.type === 'FILL_BLANK' ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Your answer: </span>
              {parsed.text?.trim() ? parsed.text : '—'}
            </p>
            {answer.correctText ? (
              <p>
                <span className="text-muted-foreground">Correct answer: </span>
                {answer.correctText}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {answer.options.map((option) => {
              const selected = selectedIds.has(option.id)
              const isCorrectOption = option.isCorrect
              return (
                <div
                  key={option.id}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm',
                    isCorrectOption && 'border-emerald-200 bg-emerald-50',
                    selected && !isCorrectOption && 'border-destructive/30 bg-destructive/5',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{option.optionText}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {selected ? <span>Your choice</span> : null}
                      {isCorrectOption ? <span>Correct</span> : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {answer.explanation ? (
          <p className="text-sm text-muted-foreground">{answer.explanation}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function AssignmentResultContent({
  id,
  variant,
}: {
  id: string
  variant: 'result' | 'review'
}) {
  const query = useQuery({
    queryKey: [...queryKeys.assignments.all, id, 'result'],
    queryFn: () => assignmentsApi.result(id),
    enabled: Boolean(id),
    retry: false,
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />

  if (query.error) {
    const message = isApiError(query.error) ? query.error.message : 'Unable to load results.'
    return (
      <div className="space-y-6">
        <PageHeader
          title={variant === 'review' ? 'Answer review' : 'Results'}
          description={message}
        />
        <Button variant="outline" asChild>
          <Link to={`/student/assignments/${id}`}>Back to assignment</Link>
        </Button>
      </div>
    )
  }

  if (!query.data) return null

  const result = query.data
  const isReview = variant === 'review'

  return (
    <div className="space-y-6">
      <PageHeader
        title={isReview ? 'Answer review' : 'Your result'}
        description={
          isReview
            ? 'Review your submitted answers and feedback.'
            : `Submitted ${formatDateTime(result.submittedAt)}`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {!isReview ? (
              <Button variant="outline" asChild>
                <Link to={`/student/assignments/${id}/review`}>Review answers</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to={`/student/assignments/${id}/result`}>View score summary</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/student/assignments">Back to assignments</Link>
            </Button>
          </div>
        }
      />

      {!isReview ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {result.score} / {result.maxScore}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Correct</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{result.correctCount}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Incorrect</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{result.incorrectCount}</CardContent>
          </Card>
        </div>
      ) : null}

      <div className="space-y-4">
        {result.answers.map((answer, index) => (
          <AnswerReviewCard key={answer.assignmentQuestionId} answer={answer} index={index} />
        ))}
      </div>
    </div>
  )
}

export function AssignmentResultPage() {
  const { id = '' } = useParams()
  return <AssignmentResultContent id={id} variant="result" />
}

export function AssignmentReviewPage() {
  const { id = '' } = useParams()
  return <AssignmentResultContent id={id} variant="review" />
}
