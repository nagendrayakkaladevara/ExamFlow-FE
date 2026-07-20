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
  description?: string
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

/** Build a strict create/update payload — omit empty optional fields. */
export function toQuestionPayload(
  values: {
    type: QuestionType
    title: string
    description: string
    defaultMarks: number
    difficulty: DifficultyLevel
    explanation?: string
    subject?: string
    topic?: string
    correctText?: string
    tagIds?: string[]
    options?: { optionText: string; isCorrect: boolean }[]
    imageUrl?: string | null
    imageBlobKey?: string | null
  },
  options?: { isEdit?: boolean },
): CreateQuestionInput {
  const payload: CreateQuestionInput = {
    type: values.type,
    title: values.title.trim(),
    defaultMarks: values.defaultMarks,
    difficulty: values.difficulty,
  }

  const description = values.description.trim()
  if (description || options?.isEdit) {
    payload.description = description
  }

  const explanation = values.explanation?.trim()
  if (explanation) payload.explanation = explanation

  const subject = values.subject?.trim()
  if (subject) payload.subject = subject

  const topic = values.topic?.trim()
  if (topic) payload.topic = topic

  if (values.tagIds?.length) {
    payload.tagIds = values.tagIds
  }

  const imageUrl = values.imageUrl?.trim() || null
  const imageBlobKey = values.imageBlobKey?.trim() || null
  if (imageUrl) {
    payload.imageUrl = imageUrl
    if (imageBlobKey) payload.imageBlobKey = imageBlobKey
  }

  if (values.type === 'FILL_BLANK') {
    payload.correctText = values.correctText?.trim() ?? ''
  } else {
    payload.options = (values.options ?? []).map((option, index) => ({
      optionText: option.optionText.trim(),
      isCorrect: option.isCorrect,
      sortOrder: index,
    }))
  }

  return payload
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
