import type { CircularRecord } from '@/types/domain'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export type CircularMetaFields = Pick<
  CircularRecord,
  'publishAt' | 'lastEditedBy' | 'lastEditedAt'
>

export function hasCircularEdits(
  circular: Pick<CircularRecord, 'lastEditedBy' | 'lastEditedAt'>,
): boolean {
  return Boolean(circular.lastEditedBy && circular.lastEditedAt)
}

export function formatCircularLastEdited(
  circular: Pick<CircularRecord, 'lastEditedBy' | 'lastEditedAt'>,
): string | null {
  if (!circular.lastEditedBy || !circular.lastEditedAt) return null
  return `Last edited by ${circular.lastEditedBy.name} · ${formatDateTime(circular.lastEditedAt)}`
}

export function formatCircularFeedMeta(
  circular: CircularMetaFields,
  options?: { includePublishedPrefix?: boolean },
): string {
  const { includePublishedPrefix = false } = options ?? {}
  const publishLabel = includePublishedPrefix
    ? `Published ${formatDateTime(circular.publishAt)}`
    : formatDateTime(circular.publishAt)

  if (!hasCircularEdits(circular)) return publishLabel

  const editLabel = `Edited by ${circular.lastEditedBy!.name} · ${formatDateTime(circular.lastEditedAt!)}`
  return includePublishedPrefix ? `${publishLabel} · ${editLabel}` : editLabel
}

interface CircularMetaLineProps {
  circular: CircularMetaFields
  className?: string
  size?: 'xs' | 'sm'
}

export function CircularPublishedMeta({
  circular,
  className,
  size = 'xs',
}: CircularMetaLineProps) {
  return (
    <p className={cn(size === 'sm' ? 'text-sm' : 'text-xs', 'text-muted-foreground', className)}>
      Published {formatDateTime(circular.publishAt)}
    </p>
  )
}

export function CircularLastEditedMeta({
  circular,
  className,
  size = 'xs',
}: CircularMetaLineProps) {
  const label = formatCircularLastEdited(circular)
  if (!label) return null

  return (
    <p className={cn(size === 'sm' ? 'text-sm' : 'text-xs', 'text-muted-foreground', className)}>
      {label}
    </p>
  )
}

export function CircularDetailMeta({ circular }: { circular: CircularMetaFields }) {
  return (
    <div className="space-y-1">
      <CircularPublishedMeta circular={circular} size="sm" />
      <CircularLastEditedMeta circular={circular} size="sm" />
    </div>
  )
}

export function CircularListMeta({ circular }: { circular: CircularMetaFields }) {
  return (
    <div className="mt-1 space-y-1">
      <CircularPublishedMeta circular={circular} />
      <CircularLastEditedMeta circular={circular} />
    </div>
  )
}
