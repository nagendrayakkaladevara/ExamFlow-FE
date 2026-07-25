import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { SelectedQuestionMeta } from '@/features/assignments/utils/questionSelection'

interface SelectedQuestionsMarksProps {
  selectedQuestions: SelectedQuestionMeta[]
  questionMarks: Record<string, number>
  onMarksChange: (questionId: string, marks: number) => void
}

export function SelectedQuestionsMarks({
  selectedQuestions,
  questionMarks,
  onMarksChange,
}: SelectedQuestionsMarksProps) {
  if (selectedQuestions.length === 0) return null

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <p className="text-sm font-medium">Marks per question</p>
        <div className="space-y-2">
          {selectedQuestions.map((question, index) => (
            <div key={question.id} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {index + 1}. {question.title}
              </span>
              <Input
                type="number"
                min={0.1}
                step={0.5}
                className="w-24"
                value={questionMarks[question.id] ?? question.defaultMarks}
                onChange={(e) => onMarksChange(question.id, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
