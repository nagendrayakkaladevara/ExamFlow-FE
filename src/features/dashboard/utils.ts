import { differenceInDays, isAfter, isBefore, parseISO } from 'date-fns'
import type { AssignmentRecord } from '@/types/domain'
import { formatDate, formatDateTime } from '@/lib/format'
import { formatRelative } from '@/lib/dates'

export type AssignmentTimingStatus = 'upcoming' | 'open' | 'closed'

export function getAssignmentTimingStatus(assignment: AssignmentRecord): AssignmentTimingStatus {
  const now = new Date()
  const start = parseISO(assignment.startAt)
  const end = parseISO(assignment.endAt)

  if (isBefore(now, start)) return 'upcoming'
  if (isAfter(now, end)) return 'closed'
  return 'open'
}

export function formatAssignmentTimingMeta(assignment: AssignmentRecord): string {
  const status = getAssignmentTimingStatus(assignment)

  if (status === 'upcoming') {
    const days = differenceInDays(parseISO(assignment.startAt), new Date())
    if (days <= 0) return `Opens ${formatRelative(assignment.startAt)}`
    return `Opens ${formatDate(assignment.startAt)}`
  }

  if (status === 'open') {
    return `Due ${formatDate(assignment.endAt)} · ${assignment.durationMinutes} min`
  }

  return `Closed ${formatDate(assignment.endAt)}`
}

export function sortAssignmentsByRelevance(assignments: AssignmentRecord[]): AssignmentRecord[] {
  const priority: Record<AssignmentTimingStatus, number> = {
    open: 0,
    upcoming: 1,
    closed: 2,
  }

  return [...assignments].sort((a, b) => {
    const statusDiff =
      priority[getAssignmentTimingStatus(a)] - priority[getAssignmentTimingStatus(b)]
    if (statusDiff !== 0) return statusDiff
    return parseISO(a.endAt).getTime() - parseISO(b.endAt).getTime()
  })
}

export function formatActivityTimestamp(value: string): string {
  return formatDateTime(value)
}
