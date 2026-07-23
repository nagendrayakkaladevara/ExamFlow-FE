import type { AssignmentRosterRow } from '@/types/domain'

export function formatStudentLabel(row: Pick<AssignmentRosterRow, 'firstName' | 'lastName' | 'email' | 'studentId'>): string {
  const fullName = [row.firstName, row.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (row.email?.trim()) return row.email.trim()
  return `Student ${row.studentId.slice(0, 8)}…`
}
