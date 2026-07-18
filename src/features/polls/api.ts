import { api } from '@/lib/api-client'
import type { PollRecord, PollResults } from '@/types/domain'
import type { AudienceTargetType, PollResultVisibility } from '@/types/enums'

export interface CreatePollInput {
  title: string
  description?: string | null
  publishAt: string
  expireAt: string
  resultVisibility: PollResultVisibility
  audiences: { targetType: AudienceTargetType; targetId?: string | null }[]
  options: { optionText: string; sortOrder: number }[]
}

export const pollsApi = {
  list: (params?: { limit?: number; cursor?: string }) =>
    api.getList<PollRecord>('/polls', { params }),

  get: (id: string) => api.get<PollRecord>(`/polls/${id}`),

  results: (id: string) => api.get<PollResults>(`/polls/${id}/results`),

  create: (body: CreatePollInput) => api.post<PollRecord>('/polls', body),

  update: (id: string, body: Partial<CreatePollInput>) =>
    api.patch<PollRecord>(`/polls/${id}`, body),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/polls/${id}`),

  vote: (id: string, optionId: string) =>
    api.post<{ voted: boolean }>(`/polls/${id}/vote`, { optionId }),
}
