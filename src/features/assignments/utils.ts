export function getAssignmentWindowMinutes(
  startAt: string,
  endAt: string,
): number | null {
  if (!startAt || !endAt) return null

  const startMs = new Date(startAt).getTime()
  const endMs = new Date(endAt).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null

  return Math.floor((endMs - startMs) / 60_000)
}

export function getDurationFitError(
  startAt: string,
  endAt: string,
  durationMinutes: number,
): string | null {
  const windowMinutes = getAssignmentWindowMinutes(startAt, endAt)
  if (windowMinutes === null) return null

  if (windowMinutes <= 0) {
    return 'End time must be after the start time.'
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
    return 'Duration must be at least 1 minute.'
  }

  if (durationMinutes > windowMinutes) {
    return `Duration cannot exceed the assignment window (${windowMinutes} minutes between start and end).`
  }

  return null
}
