import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, Pencil } from 'lucide-react'
import { QueryError } from '@/components/feedback/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { DifficultyBadge } from '@/features/questions/components/DifficultyBadge'
import { questionsApi } from '@/features/questions/api'
import { queryKeys } from '@/config/query-keys'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface QuestionViewDialogProps {
  questionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatLabel(value: string): string {
  const formatted = value.replaceAll('_', ' ').toLowerCase()
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function optionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

function DetailSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

export function QuestionViewDialog({
  questionId,
  open,
  onOpenChange,
}: QuestionViewDialogProps) {
  const questionQuery = useQuery({
    queryKey: [...queryKeys.questions.all, questionId],
    queryFn: () => questionsApi.get(questionId!),
    enabled: open && Boolean(questionId),
  })

  const question = questionQuery.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(44rem,calc(100svh-2rem))] min-h-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-3 border-b px-4 py-5 text-left sm:px-6">
          <DialogTitle className="text-xl font-semibold leading-snug">
            {question?.title?.trim() || 'Question details'}
          </DialogTitle>
          {question ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{formatLabel(question.type)}</Badge>
              <DifficultyBadge difficulty={question.difficulty} />
              <Badge variant="outline">{question.defaultMarks} marks</Badge>
              {question.subject ? (
                <span className="text-xs text-muted-foreground">{question.subject}</span>
              ) : null}
              {question.topic ? (
                <span className="text-xs text-muted-foreground">· {question.topic}</span>
              ) : null}
              <span className="text-xs text-muted-foreground">
                Updated {formatDate(question.updatedAt)}
              </span>
            </div>
          ) : null}
        </DialogHeader>

        <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-8 px-4 py-6 sm:px-6">
            {questionQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2
                  className="size-6 animate-spin text-muted-foreground"
                  aria-label="Loading question"
                />
              </div>
            ) : null}

            {questionQuery.error ? (
              <QueryError error={questionQuery.error} onRetry={() => questionQuery.refetch()} />
            ) : null}

            {question ? (
              <>
                <DetailSection title="Question Description">
                  <div className="rounded-lg border bg-muted/20 p-4 sm:p-5">
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                      {question.description}
                    </p>
                    {question.imageUrl ? (
                      <img
                        src={question.imageUrl}
                        alt=""
                        className="mt-4 max-h-64 w-full rounded-md border bg-background object-contain"
                      />
                    ) : null}
                  </div>
                </DetailSection>

                {question.type === 'FILL_BLANK' ? (
                  <DetailSection title="Correct answer">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-base leading-relaxed dark:border-emerald-900/50 dark:bg-emerald-950/60">
                      {question.correctText}
                    </div>
                  </DetailSection>
                ) : (
                  <DetailSection title="Answer options">
                    <ul className="space-y-2">
                      {(question.options ?? []).map((option, index) => (
                        <li
                          key={option.id}
                          className={cn(
                            'flex items-start gap-3 rounded-lg border px-4 py-3 text-base leading-relaxed',
                            option.isCorrect
                              ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/60'
                              : 'bg-background',
                          )}
                        >
                          <span
                            className={cn(
                              'flex size-7 shrink-0 items-center justify-center rounded-md border text-sm font-medium',
                              option.isCorrect
                                ? 'border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-muted/40 text-muted-foreground',
                            )}
                          >
                            {optionLabel(index)}
                          </span>
                          <span className="min-w-0 flex-1 pt-0.5">{option.optionText}</span>
                          {option.isCorrect ? (
                            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="size-3.5" aria-hidden />
                              Correct
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </DetailSection>
                )}

                {question.explanation ? (
                  <>
                    <Separator />
                    <DetailSection title="Explanation">
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {question.explanation}
                      </p>
                    </DetailSection>
                  </>
                ) : null}

                {(question.tags ?? []).length > 0 ? (
                  <>
                    <Separator />
                    <DetailSection title="Tags">
                      <div className="flex flex-wrap gap-2">
                        {(question.tags ?? []).map((tag) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </DetailSection>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {question ? (
          <DialogFooter className="shrink-0 border-t px-4 py-4 sm:px-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button asChild>
              <Link to={`/lecturer/questions/${question.id}/edit`}>
                <Pencil className="size-4" />
                Edit question
              </Link>
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
