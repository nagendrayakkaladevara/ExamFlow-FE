import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { assignmentsApi } from '@/features/assignments/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { isApiError } from '@/lib/errors'

export function AssignmentResultPage() {
  const { id = '' } = useParams()

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
        <PageHeader title="Results" description={message} />
        <Button variant="outline" asChild>
          <Link to={`/student/assignments/${id}`}>Back to assignment</Link>
        </Button>
      </div>
    )
  }

  if (!query.data) return null

  const result = query.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your result"
        description={`Submitted ${formatDateTime(result.submittedAt)}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/student/assignments">Back to assignments</Link>
          </Button>
        }
      />

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

      <div className="space-y-4">
        {result.answers.map((answer, index) => (
          <Card key={answer.assignmentQuestionId}>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">Question {index + 1}</p>
                <p className="text-sm">
                  {answer.marksAwarded} marks · {answer.isCorrect ? 'Correct' : 'Incorrect'}
                </p>
              </div>
              {answer.explanation ? (
                <p className="text-sm text-muted-foreground">{answer.explanation}</p>
              ) : null}
              {answer.correctText ? (
                <p className="text-sm">Correct answer: {answer.correctText}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
