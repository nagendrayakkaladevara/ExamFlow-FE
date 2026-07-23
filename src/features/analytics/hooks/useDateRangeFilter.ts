import { useMemo, useState } from 'react'
import { subDays } from 'date-fns'
import type { AnalyticsDateParams } from '@/types/domain'

export type DateRangePreset = '30d' | '90d' | 'all' | 'custom'

export function useDateRangeFilter(defaultPreset: DateRangePreset = 'all') {
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const params = useMemo((): AnalyticsDateParams => {
    const now = new Date()

    if (preset === 'all') {
      return {}
    }

    if (preset === 'custom') {
      return {
        from: customFrom ? new Date(customFrom).toISOString() : undefined,
        to: customTo ? new Date(customTo).toISOString() : undefined,
      }
    }

    const days = preset === '30d' ? 30 : 90
    return {
      from: subDays(now, days).toISOString(),
      to: now.toISOString(),
    }
  }, [preset, customFrom, customTo])

  return {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    params,
  }
}
