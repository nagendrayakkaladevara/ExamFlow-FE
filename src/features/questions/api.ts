import { api } from '@/lib/api-client'
import type { QuestionRecord } from '@/types/domain'
import type { DifficultyLevel, QuestionType } from '@/types/enums'

export interface SearchQuestionsParams {
  q?: string
  tagIds?: string
  difficulty?: DifficultyLevel
  type?: QuestionType
  subject?: string
  topic?: string
  limit?: number
  cursor?: string
}

export interface QuestionOptionInput {
  optionText: string
  isCorrect: boolean
  sortOrder: number
}

export interface CreateQuestionInput {
  type: QuestionType
  title: string
  description: string
  explanation?: string | null
  defaultMarks: number
  difficulty: DifficultyLevel
  subject?: string | null
  topic?: string | null
  correctText?: string | null
  imageUrl?: string | null
  imageBlobKey?: string | null
  tagIds?: string[]
  options?: QuestionOptionInput[]
}

export const questionsApi = {
  list: (params?: { limit?: number; cursor?: string }) =>
    api.getList<QuestionRecord>('/questions', { params }),

  search: (params?: SearchQuestionsParams) =>
    api.getList<QuestionRecord>('/questions/search', {
      params: params as Record<string, string | number | boolean | null | undefined>,
    }),

  get: (id: string) => api.get<QuestionRecord>(`/questions/${id}`),

  create: (body: CreateQuestionInput) => api.post<QuestionRecord>('/questions', body),

  update: (id: string, body: Partial<CreateQuestionInput>) =>
    api.patch<QuestionRecord>(`/questions/${id}`, body),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/questions/${id}`),
}
