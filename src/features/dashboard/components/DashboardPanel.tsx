import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DashboardPanelProps {
  title: string
  description?: string
  viewAllHref?: string
  viewAllLabel?: string
  children: ReactNode
  className?: string
}

export function DashboardPanel({
  title,
  description,
  viewAllHref,
  viewAllLabel = 'View all',
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section className={cn('rounded-lg border bg-card', className)}>
      <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {viewAllHref ? (
          <Button variant="ghost" size="sm" className="shrink-0" asChild>
            <Link to={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        ) : null}
      </div>
      <div className="px-6 py-2">{children}</div>
    </section>
  )
}

interface DashboardListItemProps {
  title: string
  meta?: string
  trailing?: ReactNode
  href?: string
}

export function DashboardListItem({ title, meta, trailing, href }: DashboardListItemProps) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </>
  )

  if (href) {
    return (
      <Link
        to={href}
        className="flex min-h-12 items-center gap-4 border-b py-3 transition-colors last:border-b-0 hover:bg-muted/40"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="flex min-h-12 items-center gap-4 border-b py-3 last:border-b-0">
      {content}
    </div>
  )
}
