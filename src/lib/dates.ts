import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, 'PPp')
}

export function formatRelative(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return formatDistanceToNow(date, { addSuffix: true })
}
