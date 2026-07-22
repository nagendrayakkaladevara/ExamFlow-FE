import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { RefreshButton } from '@/components/feedback/RefreshButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { PollTagBadge } from '@/features/polls/components/PollTagBadge'
import { pollsApi } from '@/features/polls/api'
import {
  canVoteOnPoll,
  hasParticipatedInPoll,
  isPollExpired,
  shouldShowPollResults,
  sortPollTags,
  getPollTags,
} from '@/features/polls/utils'
import { queryKeys } from '@/config/query-keys'
import { ACTIVE_PAGE_POLL_INTERVAL_MS } from '@/config/query-polling'
import { formatDateTime, formatPercent } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { isApiError } from '@/lib/errors'
import { cn } from '@/lib/utils'

export function PollDetailPage() {
  const { id = '' } = useParams()
  const role = useAuthStore((s) => s.user?.role)
  const basePath = useRoleBasePath()
  const canEdit = role === 'ADMIN' || role === 'LECTURER'
  const queryClient = useQueryClient()
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')

  const pollQuery = useQuery({
    queryKey: [...queryKeys.polls.all, id],
    queryFn: () => pollsApi.get(id),
    enabled: Boolean(id),
    refetchInterval: ACTIVE_PAGE_POLL_INTERVAL_MS,
  })

  const poll = pollQuery.data
  const showResults = poll ? shouldShowPollResults(poll) : false
  const canVote = poll ? canVoteOnPoll(poll) : false
  const participated = poll ? hasParticipatedInPoll(poll) : false
  const expired = poll ? isPollExpired(poll) : false

  const resultsQuery = useQuery({
    queryKey: [...queryKeys.polls.all, id, 'results'],
    queryFn: () => pollsApi.results(id),
    enabled: Boolean(id) && showResults,
    retry: false,
    refetchInterval: showResults ? ACTIVE_PAGE_POLL_INTERVAL_MS : false,
  })

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => pollsApi.vote(id, optionId),
    onSuccess: async () => {
      toast.success('Vote recorded.')
      await queryClient.invalidateQueries({ queryKey: queryKeys.polls.all })
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to vote.')
    },
  })

  const handleRefresh = () => {
    void pollQuery.refetch()
    if (showResults) {
      void resultsQuery.refetch()
    }
  }

  useEffect(() => {
    setSelectedOptionId('')
  }, [id])

  if (pollQuery.isLoading) return <Skeleton className="h-64 w-full" />
  if (pollQuery.error) return <QueryError error={pollQuery.error} onRetry={() => pollQuery.refetch()} />
  if (!poll) return null

  const tags = sortPollTags(getPollTags(poll))
  const sortedOptions = [...poll.options].sort((a, b) => a.sortOrder - b.sortOrder)

  const handleSubmitVote = () => {
    if (!selectedOptionId) {
      toast.error('Select an option before submitting your vote.')
      return
    }
    voteMutation.mutate(selectedOptionId)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={poll.title}
        description={poll.description ?? undefined}
        actions={
          <>
            {canEdit ? (
              <Button variant="outline" asChild>
                <Link to={`${basePath}/polls/${id}/edit`}>Edit</Link>
              </Button>
            ) : null}
            <RefreshButton
              onClick={handleRefresh}
              isRefreshing={pollQuery.isFetching || resultsQuery.isFetching}
            />
            <Button variant="outline" asChild>
              <Link to={`${basePath}/polls`}>Back</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <PollTagBadge key={tag} tag={tag} />
            ))}
          </div>
          <CardTitle className="text-xl">{poll.title}</CardTitle>
          {poll.description ? <CardDescription>{poll.description}</CardDescription> : null}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Expires {formatDateTime(poll.expireAt)}
            </span>
            <span>
              {sortedOptions.length} {sortedOptions.length === 1 ? 'option' : 'options'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {canVote ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Cast your vote</p>
                <p className="text-xs text-muted-foreground">
                  Select one option and submit your response.
                </p>
              </div>

              <RadioGroup
                value={selectedOptionId}
                onValueChange={setSelectedOptionId}
                className="gap-3"
              >
                {sortedOptions.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={option.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors',
                      selectedOptionId === option.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/40',
                    )}
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                    <span className="text-sm leading-relaxed">{option.optionText}</span>
                  </Label>
                ))}
              </RadioGroup>

              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={!selectedOptionId || voteMutation.isPending}
                onClick={handleSubmitVote}
              >
                Submit vote
              </Button>
            </div>
          ) : null}

          {participated && !canVote ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">You have voted</p>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90">
                  {expired
                    ? 'This poll has ended. Results are shown below.'
                    : 'Your response has been recorded.'}
                </p>
              </div>
            </div>
          ) : null}

          {expired && !participated ? (
            <div className="rounded-lg border bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium">Poll ended</p>
              <p className="text-xs text-muted-foreground">
                Voting closed on {formatDateTime(poll.expireAt)}.
              </p>
            </div>
          ) : null}

          {showResults ? (
            <div className="space-y-4 border-t pt-6">
              <div>
                <p className="text-sm font-medium">Results</p>
                {resultsQuery.data ? (
                  <p className="text-xs text-muted-foreground">
                    {resultsQuery.data.totalVotes}{' '}
                    {resultsQuery.data.totalVotes === 1 ? 'vote' : 'votes'} recorded
                  </p>
                ) : null}
              </div>

              {resultsQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}
              {resultsQuery.error ? (
                <QueryError error={resultsQuery.error} onRetry={() => resultsQuery.refetch()} />
              ) : null}

              {resultsQuery.data ? (
                <div className="space-y-4">
                  {resultsQuery.data.options.map((option) => {
                    const share = resultsQuery.data!.totalVotes
                      ? option.votes / resultsQuery.data!.totalVotes
                      : 0

                    return (
                      <div key={option.optionId} className="space-y-2">
                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="leading-relaxed">{option.optionText}</span>
                          <span className="shrink-0 text-muted-foreground">
                            {option.votes} · {formatPercent(share)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${share * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {!canVote && !showResults && participated ? (
            <p className="text-sm text-muted-foreground">
              Results for this poll are not available yet.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
