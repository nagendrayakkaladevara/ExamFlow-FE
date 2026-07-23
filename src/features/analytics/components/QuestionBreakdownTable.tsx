import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QueryError } from '@/components/feedback/EmptyState'
import { analyticsApi } from '@/features/analytics/api'
import { queryKeys } from '@/config/query-keys'
import { formatPercent } from '@/lib/format'
import { formatQuestionType } from '@/features/assignments/utils'

interface QuestionBreakdownTableProps {
  assignmentId: string
}

export function QuestionBreakdownTable({ assignmentId }: QuestionBreakdownTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const query = useQuery({
    queryKey: queryKeys.analytics.lecturerAssignmentQuestions(assignmentId),
    queryFn: () => analyticsApi.lecturerAssignmentQuestions(assignmentId),
    enabled: Boolean(assignmentId),
  })

  if (query.isLoading) return <Skeleton className="h-64 w-full" />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />

  const questions = query.data ?? []

  if (questions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Question analytics will appear once students submit this assignment.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="max-h-[560px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Correct rate</TableHead>
              <TableHead>Correct</TableHead>
              <TableHead>Incorrect</TableHead>
              <TableHead>Skipped</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <Fragment key={question.assignmentQuestionId}>
                <TableRow
                  className={
                    question.topWrongAnswers.length > 0 ? 'cursor-pointer hover:bg-muted/50' : undefined
                  }
                  onClick={() => {
                    if (question.topWrongAnswers.length === 0) return
                    setExpandedId((current) =>
                      current === question.assignmentQuestionId
                        ? null
                        : question.assignmentQuestionId,
                    )
                  }}
                >
                  <TableCell className="tabular-nums text-muted-foreground">
                    {question.sortOrder}
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">{question.title}</TableCell>
                  <TableCell>{formatQuestionType(question.type)}</TableCell>
                  <TableCell className="tabular-nums">
                    {question.correctRate != null ? formatPercent(question.correctRate) : '—'}
                  </TableCell>
                  <TableCell className="tabular-nums">{question.correctCount}</TableCell>
                  <TableCell className="tabular-nums">{question.incorrectCount}</TableCell>
                  <TableCell className="tabular-nums">{question.skippedCount}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.tags.length > 0 ? (
                        question.tags.map((tag) => (
                          <Badge key={tag.tagId} variant="secondary">
                            {tag.tagName}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {expandedId === question.assignmentQuestionId &&
                question.topWrongAnswers.length > 0 ? (
                  <TableRow key={`${question.assignmentQuestionId}-distractors`}>
                    <TableCell colSpan={8} className="bg-muted/30">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Common wrong answers
                      </p>
                      <ul className="space-y-1 text-sm">
                        {question.topWrongAnswers.map((answer) => (
                          <li
                            key={answer.optionText}
                            className="flex items-center justify-between gap-4"
                          >
                            <span>{answer.optionText}</span>
                            <span className="tabular-nums text-muted-foreground">
                              {answer.count} ({answer.percentage}%)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
