import { format, parseISO } from 'date-fns'

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'MMM d, yyyy · h:mm a')
  } catch {
    return value
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'MMM d, yyyy')
  } catch {
    return value
  }
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${Math.round(value * 100)}%`
}

export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const date = parseISO(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  } catch {
    return ''
  }
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString()
}
