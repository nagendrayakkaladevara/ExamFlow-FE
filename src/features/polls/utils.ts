import type { PollRecord } from '@/types/domain'
import type { PollTag } from '@/types/enums'

const TAG_SORT_ORDER: PollTag[] = ['active', 'participated', 'expired']

const POLL_LIST_PRIORITY = {
  active: 0,
  participated: 1,
  participatedExpired: 1.5,
  expired: 2,
  other: 99,
} as const

export function getPollTags(poll: PollRecord): PollTag[] {
  return poll.tags ?? []
}

export function hasPollTag(poll: PollRecord, tag: PollTag): boolean {
  return getPollTags(poll).includes(tag)
}

export function sortPollTags(tags: PollTag[]): PollTag[] {
  return [...tags].sort(
    (a, b) => TAG_SORT_ORDER.indexOf(a) - TAG_SORT_ORDER.indexOf(b),
  )
}

function getPollListPriority(poll: PollRecord): number {
  const tags = getPollTags(poll)
  if (tags.includes('active')) return POLL_LIST_PRIORITY.active
  if (tags.includes('participated') && !tags.includes('expired')) {
    return POLL_LIST_PRIORITY.participated
  }
  if (tags.includes('expired') && !tags.includes('participated')) {
    return POLL_LIST_PRIORITY.expired
  }
  if (tags.includes('participated') && tags.includes('expired')) {
    return POLL_LIST_PRIORITY.participatedExpired
  }
  return POLL_LIST_PRIORITY.other
}

export function sortPolls(polls: PollRecord[]): PollRecord[] {
  return [...polls].sort((a, b) => {
    const priorityDiff = getPollListPriority(a) - getPollListPriority(b)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.expireAt).getTime() - new Date(a.expireAt).getTime()
  })
}

export function canVoteOnPoll(poll: PollRecord): boolean {
  return hasPollTag(poll, 'active')
}

export function hasParticipatedInPoll(poll: PollRecord): boolean {
  return hasPollTag(poll, 'participated')
}

export function isPollExpired(poll: PollRecord): boolean {
  return hasPollTag(poll, 'expired')
}

export function shouldShowPollResults(poll: PollRecord): boolean {
  const participated = hasParticipatedInPoll(poll)
  const expired = isPollExpired(poll)

  if (poll.resultVisibility === 'NEVER') return false
  if (poll.resultVisibility === 'AFTER_VOTE' && participated) return true
  if (poll.resultVisibility === 'AFTER_EXPIRY' && expired) return true
  return false
}
