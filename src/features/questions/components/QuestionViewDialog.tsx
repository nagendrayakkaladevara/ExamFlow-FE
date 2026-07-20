import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { questionsApi } from '@/features/questions/api'
import { queryKeys } from '@/config/query-keys'

interface QuestionViewDialogProps {
  questionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ').toLowerCase()
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
      <DialogContent className="flex max-h-[min(36rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>{question?.title ?? 'Question details'}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {questionQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading question" />
            </div>
          ) : null}

          {questionQuery.error ? (
            <QueryError error={questionQuery.error} onRetry={() => questionQuery.refetch()} />
          ) : null}

          {question ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{formatLabel(question.type)}</Badge>
                <Badge variant="outline">{formatLabel(question.difficulty)}</Badge>
                <Badge variant="outline">{question.defaultMarks} marks</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{question.description}</p>
              </div>

              {question.imageUrl ? (
                <img
                  src={question.imageUrl}
                  alt=""
                  className="max-h-48 w-full rounded-lg border object-contain"
                />
              ) : null}

              {question.type === 'FILL_BLANK' ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Correct answer</p>
                  <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{question.correctText}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Options</p>
                  <ul className="space-y-2">
                    {(question.options ?? []).map((option) => (
                      <li
                        key={option.id}
                        className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 flex-1">{option.optionText}</span>
                        {option.isCorrect ? (
                          <Badge variant="default" className="shrink-0">
                            Correct
                          </Badge>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.explanation ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Explanation</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{question.explanation}</p>
                </div>
              ) : null}

              {(question.subject || question.topic) ? (
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {question.subject ? <span>Subject: {question.subject}</span> : null}
                  {question.topic ? <span>Topic: {question.topic}</span> : null}
                </div>
              ) : null}

              {(question.tags ?? []).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {(question.tags ?? []).map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {question ? (
          <DialogFooter className="shrink-0 border-t px-4 py-4 sm:px-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button asChild>
              <Link to={`/lecturer/questions/${question.id}/edit`}>Edit question</Link>
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
