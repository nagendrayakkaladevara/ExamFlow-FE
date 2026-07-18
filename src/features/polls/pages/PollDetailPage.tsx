import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { pollsApi } from '@/features/polls/api'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime, formatPercent } from '@/lib/format'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { isApiError } from '@/lib/errors'

export function PollDetailPage() {
  const { id = '' } = useParams()
  const basePath = useRoleBasePath()
  const [hasVoted, setHasVoted] = useState(false)

  const pollQuery = useQuery({
    queryKey: [...queryKeys.polls.all, id],
    queryFn: () => pollsApi.get(id),
    enabled: Boolean(id),
  })

  const resultsQuery = useQuery({
    queryKey: [...queryKeys.polls.all, id, 'results'],
    queryFn: () => pollsApi.results(id),
    enabled: Boolean(id) && hasVoted,
    retry: false,
  })

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => pollsApi.vote(id, optionId),
    onSuccess: () => {
      setHasVoted(true)
      toast.success('Vote recorded.')
      resultsQuery.refetch()
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to vote.')
    },
  })

  if (pollQuery.isLoading) return <Skeleton className="h-64 w-full" />
  if (pollQuery.error) return <QueryError error={pollQuery.error} onRetry={() => pollQuery.refetch()} />
  if (!pollQuery.data) return null

  const poll = pollQuery.data

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={poll.title}
        description={poll.description ?? `Expires ${formatDateTime(poll.expireAt)}`}
        actions={
          <Button variant="outline" asChild>
            <Link to={`${basePath}/polls`}>Back</Link>
          </Button>
        }
      />

      {!hasVoted ? (
        <Card>
          <CardHeader>
            <CardTitle>Cast your vote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {poll.options.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant="outline"
                className="w-full justify-start"
                disabled={voteMutation.isPending}
                onClick={() => voteMutation.mutate(option.id)}
              >
                {option.optionText}
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {resultsQuery.data ? (
        <Card>
          <CardHeader>
            <CardTitle>Results · {resultsQuery.data.totalVotes} votes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resultsQuery.data.options.map((option) => (
              <div key={option.optionId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{option.optionText}</span>
                  <span>
                    {option.votes} ·{' '}
                    {formatPercent(
                      resultsQuery.data!.totalVotes
                        ? option.votes / resultsQuery.data!.totalVotes
                        : 0,
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${
                        resultsQuery.data.totalVotes
                          ? (option.votes / resultsQuery.data.totalVotes) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
