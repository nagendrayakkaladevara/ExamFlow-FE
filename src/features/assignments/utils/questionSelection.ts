import type { QuestionRecord } from '@/types/domain'

export interface SelectedQuestionMeta {
  id: string
  title: string
  defaultMarks: number
}

type QuestionTitleSource = {
  title?: string | null
  description?: string | null
}

export function getQuestionDisplayTitle(
  question: QuestionTitleSource | undefined,
): string {
  const title = question?.title?.trim()
  if (title) return title

  const description = question?.description?.trim()
  if (description) {
    return description.length > 80 ? `${description.slice(0, 80)}…` : description
  }

  return 'Untitled question'
}

export function toSelectedQuestionMeta(
  questionId: string,
  questions: QuestionRecord[],
  existing?: SelectedQuestionMeta,
): SelectedQuestionMeta {
  if (existing) return existing

  const question = questions.find((item) => item.id === questionId)
  return {
    id: questionId,
    title: getQuestionDisplayTitle(question),
    defaultMarks: question?.defaultMarks ?? 1,
  }
}

export function syncSelectedQuestionMeta(
  selectedIds: string[],
  questions: QuestionRecord[],
  current: SelectedQuestionMeta[],
): SelectedQuestionMeta[] {
  const currentById = new Map(current.map((item) => [item.id, item]))

  return selectedIds.map((questionId) =>
    toSelectedQuestionMeta(questionId, questions, currentById.get(questionId)),
  )
}
