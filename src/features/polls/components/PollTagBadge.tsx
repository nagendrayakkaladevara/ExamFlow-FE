import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PollTag } from '@/types/enums'

const tagConfig: Record<PollTag, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-blue-50 text-blue-600',
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-50 text-red-600',
  },
  participated: {
    label: 'Participated',
    className: 'bg-emerald-50 text-emerald-600',
  },
}

export function PollTagBadge({ tag }: { tag: PollTag }) {
  const config = tagConfig[tag]

  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
