import type { AssignmentQuestion } from '@/types/domain'
import type { LecturerAssignmentAnalytics } from '@/types/domain'

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

export interface StudentRankingRow {
  rank: number | null
  studentId: string
  studentName?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  score: number | null
  maxScore: number | null
  submittedAt: string | null
  status?: string | null
}

export function formatStudentLabel(row: StudentRankingRow): string {
  if (row.studentName?.trim()) return row.studentName.trim()
  const fullName = [row.firstName, row.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (row.email?.trim()) return row.email.trim()
  return `Student ${row.studentId.slice(0, 8)}…`
}

export function isStudentCompleted(row: StudentRankingRow): boolean {
  if (row.status) {
    const normalized = row.status.toUpperCase()
    return normalized === 'SUBMITTED' || normalized === 'AUTO_SUBMITTED'
  }
  return Boolean(row.submittedAt)
}

export function partitionStudents(rankings: StudentRankingRow[]) {
  const completed = rankings.filter(isStudentCompleted)
  const pending = rankings.filter((row) => !isStudentCompleted(row))
  return { completed, pending }
}

export function getPendingCount(
  analytics: LecturerAssignmentAnalytics,
  rankings: StudentRankingRow[],
): number {
  const { pending } = partitionStudents(rankings)
  if (pending.length > 0) return pending.length
  return Math.max(analytics.enrolled - analytics.submitted, 0)
}
