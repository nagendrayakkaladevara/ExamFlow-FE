import { api } from '@/lib/api-client'
import type {
  AssignmentDetail,
  AssignmentRecord,
  AssignmentResult,
  AttemptRecord,
  SubmissionRecord,
} from '@/types/domain'
import type { ResultPolicy } from '@/types/enums'

export interface CreateAssignmentInput {
  classId: string
  title: string
  description?: string | null
  startAt: string
  endAt: string
  durationMinutes: number
  resultPolicy: ResultPolicy
  resultDeclareAt?: string | null
  isPublished?: boolean
}

export interface ImportQuestionsInput {
  questions: { questionId: string; marks?: number; sortOrder: number }[]
}

export interface AutosaveInput {
  answers: {
    assignmentQuestionId: string
    answer: { selectedOptionIds?: string[]; text?: string } | null
  }[]
}

export const assignmentsApi = {
  list: () => api.get<AssignmentRecord[]>('/assignments'),

  get: (id: string) => api.get<AssignmentDetail>(`/assignments/${id}`),

  create: (body: CreateAssignmentInput) =>
    api.post<AssignmentRecord>('/assignments', body),

  update: (id: string, body: Partial<CreateAssignmentInput>) =>
    api.patch<AssignmentRecord>(`/assignments/${id}`, body),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/assignments/${id}`),

  importQuestions: (id: string, body: ImportQuestionsInput) =>
    api.post<AssignmentDetail>(`/assignments/${id}/questions`, body),

  start: (id: string) => api.post<SubmissionRecord>(`/assignments/${id}/start`, {}),

  getAttempt: (id: string) => api.get<AttemptRecord>(`/assignments/${id}/attempt`),

  autosave: (id: string, body: AutosaveInput) =>
    api.post<{ saved: boolean }>(`/assignments/${id}/autosave`, body),

  submit: (id: string) => api.post<SubmissionRecord>(`/assignments/${id}/submit`, {}),

  result: (id: string) => api.get<AssignmentResult>(`/assignments/${id}/result`),
}
