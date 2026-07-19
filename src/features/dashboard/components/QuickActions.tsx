import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuickAction {
  label: string
  href: string
  icon?: LucideIcon
  variant?: 'default' | 'outline'
}

interface QuickActionsProps {
  title?: string
  actions: QuickAction[]
  className?: string
}

export function QuickActions({
  title = 'Quick actions',
  actions,
  className,
}: QuickActionsProps) {
  return (
    <section className={cn('rounded-lg border bg-card p-6', className)}>
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4 flex flex-col gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.href}
              variant={action.variant ?? 'outline'}
              className="justify-start"
              asChild
            >
              <Link to={action.href}>
                {Icon ? <Icon className="size-4" /> : null}
                {action.label}
              </Link>
            </Button>
          )
        })}
      </div>
    </section>
  )
}
