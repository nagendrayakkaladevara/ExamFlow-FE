import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Plus } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PollTagBadge } from '@/features/polls/components/PollTagBadge'
import { pollsApi } from '@/features/polls/api'
import { sortPolls, sortPollTags, getPollTags } from '@/features/polls/utils'
import { queryKeys } from '@/config/query-keys'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import {
  fadeInUp,
  motionTransition,
  scaleIn,
  staggerContainer,
} from '@/lib/motion'

function PollFeedSkeleton() {
  return (
    <div className="divide-y rounded-lg border">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 px-6 py-5">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-48" />
        </div>
      ))}
    </div>
  )
}

export function PollsListPage() {
  const role = useAuthStore((s) => s.user?.role)
  const basePath = useRoleBasePath()
  const canCreate = role === 'ADMIN' || role === 'LECTURER'
  const reducedMotion = useReducedMotion()

  const query = useQuery({
    queryKey: queryKeys.polls.all,
    queryFn: async () => {
      const result = await pollsApi.list({ limit: 50 })
      return sortPolls(result.data)
    },
  })

  const itemTransition = motionTransition(reducedMotion ?? false, 0.22)
  const panelTransition = motionTransition(reducedMotion ?? false, 0.28)

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp} transition={itemTransition}>
        <PageHeader
          title="Polls"
          description="Share your opinion on active polls and review past responses."
          actions={
            canCreate ? (
              <Button asChild>
                <Link to={`${basePath}/polls/new`}>
                  <Plus className="size-4" />
                  New poll
                </Link>
              </Button>
            ) : undefined
          }
        />
      </motion.div>

      {query.isLoading ? <PollFeedSkeleton /> : null}
      {query.error ? <QueryError error={query.error} onRetry={() => query.refetch()} /> : null}

      <AnimatePresence mode="wait">
        {query.data?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={itemTransition}
          >
            <EmptyState
              title="No polls yet"
              description="Active and past polls will appear here when published."
            />
          </motion.div>
        ) : null}

        {query.data && query.data.length > 0 ? (
          <motion.div
            key="feed"
            className="divide-y overflow-hidden rounded-lg border bg-card"
            variants={scaleIn}
            transition={panelTransition}
            initial="hidden"
            animate="visible"
          >
            {query.data.map((poll, index) => {
              const tags = sortPollTags(getPollTags(poll))
              const optionCount = poll.options.length

              return (
                <motion.div
                  key={poll.id}
                  variants={fadeInUp}
                  transition={motionTransition(reducedMotion ?? false, 0.22, index * 0.04)}
                >
                  <div className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-muted/40">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {tags.map((tag) => (
                          <PollTagBadge key={tag} tag={tag} />
                        ))}
                      </div>

                      <div>
                        <p className="text-sm font-medium">{poll.title}</p>
                        {poll.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {poll.description}
                          </p>
                        ) : null}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {optionCount} {optionCount === 1 ? 'option' : 'options'} · Expires{' '}
                        {formatDateTime(poll.expireAt)}
                      </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link to={`${basePath}/polls/${poll.id}`}>
                        Open
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
