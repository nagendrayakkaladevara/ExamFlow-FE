import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DifficultyBadge } from '@/features/questions/components/DifficultyBadge'
import { QuestionViewDialog } from '@/features/questions/components/QuestionViewDialog'
import {
  formatQuestionType,
  getTotalMarks,
  sortAssignmentQuestions,
} from '@/features/assignments/utils'
import type { AssignmentQuestion } from '@/types/domain'

interface AssignmentQuestionsPanelProps {
  questions: AssignmentQuestion[]
}

export function AssignmentQuestionsPanel({ questions }: AssignmentQuestionsPanelProps) {
  const [viewQuestionId, setViewQuestionId] = useState<string | null>(null)
  const sortedQuestions = useMemo(() => sortAssignmentQuestions(questions), [questions])
  const totalMarks = useMemo(() => getTotalMarks(questions), [questions])

  if (questions.length === 0) {
    return (
      <EmptyState
        title="No questions added"
        description="This assignment does not have any questions yet."
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length === 1 ? '' : 's'} · {totalMarks} total marks
          </p>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Marks</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuestions.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{item.question.title}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.question.description}
                      </p>
                      {item.question.subject || item.question.topic ? (
                        <p className="text-xs text-muted-foreground">
                          {[item.question.subject, item.question.topic].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatQuestionType(item.question.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={item.question.difficulty} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{item.marks}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewQuestionId(item.questionId)}
                    >
                      <Eye className="size-4" />
                      <span className="sr-only">View question</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <QuestionViewDialog
        questionId={viewQuestionId}
        open={Boolean(viewQuestionId)}
        onOpenChange={(open) => {
          if (!open) setViewQuestionId(null)
        }}
      />
    </>
  )
}
