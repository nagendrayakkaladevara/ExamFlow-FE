const REFRESH_BUFFER_MS = 60_000

let refreshTimer: ReturnType<typeof setTimeout> | null = null

const EXPIRES_IN_MULTIPLIERS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const

export function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/)
  if (!match) return 15 * 60_000

  const [, amount, unit] = match
  return Number(amount) * EXPIRES_IN_MULTIPLIERS[unit as keyof typeof EXPIRES_IN_MULTIPLIERS]
}

export function getTokenExpiresAt(expiresIn: string): number {
  return Date.now() + parseExpiresIn(expiresIn)
}

export function cancelProactiveRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

export function scheduleProactiveRefresh(
  expiresIn: string,
  onRefresh: () => Promise<void>,
): void {
  cancelProactiveRefresh()

  const delay = Math.max(parseExpiresIn(expiresIn) - REFRESH_BUFFER_MS, 0)

  refreshTimer = setTimeout(() => {
    void onRefresh()
  }, delay)
}
