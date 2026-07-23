import type { AssignmentRosterSubmissionStatus } from '@/types/domain'

export type RosterStatusLabel = 'Completed' | 'In progress' | 'Not started'

export function isCompletedStatus(status: AssignmentRosterSubmissionStatus): boolean {
  return status === 'SUBMITTED' || status === 'AUTO_SUBMITTED'
}

export function isInProgressStatus(status: AssignmentRosterSubmissionStatus): boolean {
  return status === 'IN_PROGRESS'
}

export function isNotStartedStatus(status: AssignmentRosterSubmissionStatus): boolean {
  return status === null
}

export function getRosterStatusLabel(status: AssignmentRosterSubmissionStatus): RosterStatusLabel {
  if (isCompletedStatus(status)) return 'Completed'
  if (isInProgressStatus(status)) return 'In progress'
  return 'Not started'
}
