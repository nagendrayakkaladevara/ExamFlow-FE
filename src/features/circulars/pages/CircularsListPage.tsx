import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, QueryError } from '@/components/feedback/EmptyState'
import { RefreshButton } from '@/components/feedback/RefreshButton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { circularsApi } from '@/features/circulars/api'
import { queryKeys } from '@/config/query-keys'
import { ACTIVE_PAGE_POLL_INTERVAL_MS } from '@/config/query-polling'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import {
  fadeInUp,
  motionTransition,
  scaleIn,
  staggerContainer,
} from '@/lib/motion'

function CircularFeedSkeleton() {
  return (
    <div className="divide-y rounded-lg border">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2 px-6 py-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

export function CircularsListPage() {
  const role = useAuthStore((s) => s.user?.role)
  const basePath = useRoleBasePath()
  const canCreate = role === 'ADMIN' || role === 'LECTURER'
  const reducedMotion = useReducedMotion()

  const query = useQuery({
    queryKey: queryKeys.circulars.all,
    queryFn: async () => {
      const result = await circularsApi.list({ limit: 50 })
      return result.data
    },
    refetchInterval: ACTIVE_PAGE_POLL_INTERVAL_MS,
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
          title="Circulars"
          description="Institution announcements and updates."
          actions={
            <>
              <RefreshButton onClick={() => query.refetch()} isRefreshing={query.isFetching} />
              {canCreate ? (
                <Button asChild>
                  <Link to={`${basePath}/circulars/new`}>
                    <Plus className="size-4" />
                    New circular
                  </Link>
                </Button>
              ) : null}
            </>
          }
        />
      </motion.div>

      {query.isLoading ? <CircularFeedSkeleton /> : null}
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
            <EmptyState title="No circulars yet" description="Announcements will appear here." />
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
            {query.data.map((circular, index) => (
              <motion.div
                key={circular.id}
                variants={fadeInUp}
                transition={motionTransition(reducedMotion ?? false, 0.22, index * 0.04)}
              >
                <motion.div whileTap={reducedMotion ? undefined : { scale: 0.995 }}>
                  <Link
                    to={`${basePath}/circulars/${circular.id}`}
                    className="block px-6 py-4 transition-colors hover:bg-muted/40"
                  >
                    <p className="text-sm font-medium">{circular.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Published {formatDateTime(circular.publishAt)}
                    </p>
                    {circular.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {circular.description}
                      </p>
                    ) : null}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
