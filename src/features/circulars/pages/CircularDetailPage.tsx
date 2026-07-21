import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { QueryError } from '@/components/feedback/EmptyState'
import { RefreshButton } from '@/components/feedback/RefreshButton'
import { Skeleton } from '@/components/ui/skeleton'
import { circularsApi } from '@/features/circulars/api'
import { queryKeys } from '@/config/query-keys'
import { ACTIVE_PAGE_POLL_INTERVAL_MS } from '@/config/query-polling'
import { formatDateTime } from '@/lib/format'
import {
  fadeIn,
  fadeInUp,
  motionTransition,
  scaleIn,
  staggerContainer,
} from '@/lib/motion'

function CircularDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-8 rounded-lg border p-6 md:p-8">
        <div className="space-y-4 border-b pb-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function CircularDetailPage() {
  const { id = '' } = useParams()
  const reducedMotion = useReducedMotion()

  const query = useQuery({
    queryKey: [...queryKeys.circulars.all, id],
    queryFn: () => circularsApi.get(id),
    enabled: Boolean(id),
    refetchInterval: ACTIVE_PAGE_POLL_INTERVAL_MS,
  })

  const itemTransition = motionTransition(reducedMotion ?? false, 0.25)
  const panelTransition = motionTransition(reducedMotion ?? false, 0.3)

  if (query.isLoading) return <CircularDetailSkeleton />
  if (query.error) return <QueryError error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null

  const circular = query.data

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className="mx-auto max-w-3xl space-y-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={fadeIn}
        transition={panelTransition}
      >
        <div className="flex justify-end">
          <RefreshButton onClick={() => query.refetch()} isRefreshing={query.isFetching} />
        </div>

        <motion.article>
          <motion.div
            className="rounded-lg border bg-card"
            variants={scaleIn}
            transition={panelTransition}
          >
            <motion.div
              className="space-y-8 p-6 md:p-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.header
                className="space-y-4 border-b pb-8"
                variants={fadeInUp}
                transition={itemTransition}
              >
                <p className="text-xs text-muted-foreground">Circular</p>
                <h1 className="text-3xl font-semibold tracking-tight">{circular.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Published {formatDateTime(circular.publishAt)}
                </p>
              </motion.header>

              {circular.coverImageUrl ? (
                <motion.img
                  src={circular.coverImageUrl}
                  alt=""
                  className="aspect-[21/9] w-full rounded-md border object-cover"
                  variants={fadeInUp}
                  transition={motionTransition(reducedMotion ?? false, 0.25, 0.05)}
                />
              ) : null}

              <motion.div
                className="whitespace-pre-wrap text-base leading-relaxed"
                variants={fadeInUp}
                transition={motionTransition(reducedMotion ?? false, 0.25, 0.1)}
              >
                {circular.description}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.article>
      </motion.div>
    </AnimatePresence>
  )
}
