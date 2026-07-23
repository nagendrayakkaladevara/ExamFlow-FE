import { parseISO } from 'date-fns'
import type { AssignmentQuestion, AssignmentRecord } from '@/types/domain'
import type { AssignmentRosterRow } from '@/types/domain'
import { formatStudentLabel } from '@/features/analytics/utils/student-label'
import { isCompletedStatus } from '@/features/analytics/utils/roster-status'
import type { SubmissionStatus, UserRole } from '@/types/enums'
import { getAssignmentTimingStatus } from '@/features/dashboard/utils'

export type AssignmentDisplayStatus =
  | 'draft'
  | 'upcoming'
  | 'open'
  | 'in_progress'
  | 'submitted'
  | 'auto_submitted'
  | 'expired'

export function getAssignmentDisplayStatus(
  assignment: AssignmentRecord,
  options: {
    role: UserRole
    submissionStatus?: SubmissionStatus | string | null
  },
): AssignmentDisplayStatus {
  const { role, submissionStatus } = options
  const timing = getAssignmentTimingStatus(assignment)

  if (role === 'LECTURER' || role === 'ADMIN') {
    if (!assignment.isPublished) return 'draft'
    if (timing === 'upcoming') return 'upcoming'
    if (timing === 'open') return 'open'
    return 'expired'
  }

  const resolvedSubmissionStatus =
    submissionStatus ?? assignment.mySubmission?.status ?? null

  if (resolvedSubmissionStatus) {
    const normalized = resolvedSubmissionStatus.toUpperCase()
    if (normalized === 'SUBMITTED') return 'submitted'
    if (normalized === 'AUTO_SUBMITTED') return 'auto_submitted'
    if (normalized === 'IN_PROGRESS') {
      return timing === 'closed' ? 'expired' : 'in_progress'
    }
  }

  if (timing === 'upcoming') return 'upcoming'
  if (timing === 'open') return 'open'
  return 'expired'
}

export function sortAssignmentsByDisplayStatus(
  assignments: AssignmentRecord[],
  getStatus: (assignment: AssignmentRecord) => AssignmentDisplayStatus,
): AssignmentRecord[] {
  const priority: Record<AssignmentDisplayStatus, number> = {
    open: 0,
    in_progress: 1,
    upcoming: 2,
    submitted: 3,
    auto_submitted: 3,
    expired: 4,
    draft: 5,
  }

  return [...assignments].sort((a, b) => {
    const statusDiff = priority[getStatus(a)] - priority[getStatus(b)]
    if (statusDiff !== 0) return statusDiff
    return parseISO(a.endAt).getTime() - parseISO(b.endAt).getTime()
  })
}

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

export function getStartAtNotInPastError(
  startAt: string,
  now: Date = new Date(),
): string | null {
  if (!startAt) return null

  const startMs = new Date(startAt).getTime()
  const nowMs = now.getTime()
  if (Number.isNaN(startMs)) return null

  if (startMs < nowMs) {
    return 'Start time must not be in the past.'
  }

  return null
}

export function getEndAfterStartError(
  startAt: string,
  endAt: string,
): string | null {
  if (!startAt || !endAt) return null

  const startMs = new Date(startAt).getTime()
  const endMs = new Date(endAt).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null

  if (endMs <= startMs) {
    return 'End time must be after the start time.'
  }

  return null
}

export function getDurationFitError(
  startAt: string,
  endAt: string,
  durationMinutes: number,
): string | null {
  if (getEndAfterStartError(startAt, endAt)) return null

  const windowMinutes = getAssignmentWindowMinutes(startAt, endAt)
  if (windowMinutes === null) return null

  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
    return 'Duration must be at least 1 minute.'
  }

  if (durationMinutes > windowMinutes) {
    return `Duration cannot exceed the assignment window (${windowMinutes} minutes between start and end).`
  }

  return null
}

export function getResultDeclareAtError(
  endAt: string,
  resultDeclareAt: string,
): string | null {
  if (!endAt || !resultDeclareAt) return null

  const endMs = new Date(endAt).getTime()
  const declareMs = new Date(resultDeclareAt).getTime()
  if (Number.isNaN(endMs) || Number.isNaN(declareMs)) return null

  if (declareMs <= endMs) {
    return 'Result declaration must be after the assignment end time.'
  }

  return null
}

export function sortAssignmentQuestions(questions: AssignmentQuestion[]): AssignmentQuestion[] {
  return [...questions].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getTotalMarks(questions: AssignmentQuestion[]): number {
  return questions.reduce((sum, item) => sum + item.marks, 0)
}

export function formatQuestionType(type: string): string {
  const formatted = type.replaceAll('_', ' ').toLowerCase()
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function isSubmissionCompleted(status: SubmissionStatus | string): boolean {
  const normalized = status.toUpperCase()
  return normalized === 'SUBMITTED' || normalized === 'AUTO_SUBMITTED'
}

export function canViewResults(assignment: AssignmentRecord, now = Date.now()): boolean {
  switch (assignment.resultPolicy) {
    case 'IMMEDIATE':
      return true
    case 'AFTER_COMPLETION':
      return now >= new Date(assignment.endAt).getTime()
    case 'SCHEDULED':
      return assignment.resultDeclareAt
        ? now >= new Date(assignment.resultDeclareAt).getTime()
        : false
    default:
      return false
  }
}

export type StudentRankingRow = AssignmentRosterRow

export { formatStudentLabel }

export function isStudentCompleted(row: StudentRankingRow): boolean {
  return isCompletedStatus(row.status) || Boolean(row.submittedAt)
}
