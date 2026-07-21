import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PollTag } from '@/types/enums'

const tagConfig: Record<PollTag, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
  },
  expired: {
    label: 'Expired',
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300',
  },
  participated: {
    label: 'Participated',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
}

export function PollTagBadge({ tag }: { tag: PollTag }) {
  const config = tagConfig[tag]

  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
