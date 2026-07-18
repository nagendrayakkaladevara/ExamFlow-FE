import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClassOptions } from '@/hooks/useClassOptions'
import { assignmentsApi } from '@/features/assignments/api'
import { questionsApi } from '@/features/questions/api'
import { queryKeys } from '@/config/query-keys'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/format'
import type { ResultPolicy } from '@/types/enums'
import { isApiError } from '@/lib/errors'

export function AssignmentCreatePage() {
  const navigate = useNavigate()
  const { classes } = useClassOptions()
  const [step, setStep] = useState(1)
  const [assignmentId, setAssignmentId] = useState<string | null>(null)

  const [classId, setClassId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState(toDatetimeLocalValue(new Date().toISOString()))
  const [endAt, setEndAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [resultPolicy, setResultPolicy] = useState<ResultPolicy>('IMMEDIATE')
  const [resultDeclareAt, setResultDeclareAt] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const questionsQuery = useQuery({
    queryKey: queryKeys.questions.list({ scope: 'import' }),
    queryFn: async () => {
      const result = await questionsApi.list({ limit: 100 })
      return result.data
    },
    enabled: step === 2,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      assignmentsApi.create({
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
        isPublished: true,
      }),
    onSuccess: (assignment) => {
      setAssignmentId(assignment.id)
      setStep(2)
      toast.success('Assignment created. Now add questions.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to create assignment.')
    },
  })

  const importMutation = useMutation({
    mutationFn: () =>
      assignmentsApi.importQuestions(assignmentId!, {
        questions: selectedQuestions.map((questionId, index) => ({
          questionId,
          sortOrder: index,
        })),
      }),
    onSuccess: () => {
      toast.success('Questions imported.')
      navigate(`/lecturer/assignments/${assignmentId}`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to import questions.')
    },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Create assignment"
        description={step === 1 ? 'Step 1 of 2 — Assignment details' : 'Step 2 of 2 — Import questions'}
        actions={
          <Button variant="outline" asChild>
            <Link to="/lecturer/assignments">Cancel</Link>
          </Button>
        }
      />

      {step === 1 ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1">
              <Label>Class</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}{cls.code ? ` (${cls.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label>Results</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={resultPolicy}
                  onChange={(e) => setResultPolicy(e.target.value as ResultPolicy)}
                >
                  <option value="IMMEDIATE">Immediately after submission</option>
                  <option value="AFTER_COMPLETION">After assignment ends</option>
                  <option value="SCHEDULED">Scheduled date</option>
                </select>
              </div>
            </div>
            {resultPolicy === 'SCHEDULED' ? (
              <div className="space-y-1">
                <Label>Result declare at</Label>
                <Input
                  type="datetime-local"
                  value={resultDeclareAt}
                  onChange={(e) => setResultDeclareAt(e.target.value)}
                />
              </div>
            ) : null}
            <Button
              type="button"
              disabled={!classId || !title.trim() || !endAt || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Continue to questions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Select questions from your question bank to include in this assignment.
            </p>
            <div className="space-y-2">
              {(questionsQuery.data ?? []).map((question) => {
                const selected = selectedQuestions.includes(question.id)
                return (
                  <label
                    key={question.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        setSelectedQuestions((prev) =>
                          selected
                            ? prev.filter((id) => id !== question.id)
                            : [...prev, question.id],
                        )
                      }
                    />
                    <div>
                      <p className="font-medium">{question.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {question.type.replace('_', ' ').toLowerCase()} · {question.defaultMarks} marks
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
            <Button
              type="button"
              disabled={selectedQuestions.length === 0 || importMutation.isPending}
              onClick={() => importMutation.mutate()}
            >
              Finish and publish
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
