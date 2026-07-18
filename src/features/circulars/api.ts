import { api } from '@/lib/api-client'
import type { CircularRecord } from '@/types/domain'
import type { AudienceTargetType } from '@/types/enums'

export interface CreateCircularInput {
  title: string
  description: string
  coverImageUrl?: string | null
  coverImageBlobKey?: string | null
  publishAt: string
  audiences: { targetType: AudienceTargetType; targetId?: string | null }[]
}

export const circularsApi = {
  list: (params?: { limit?: number; cursor?: string }) =>
    api.getList<CircularRecord>('/circulars', { params }),

  get: (id: string) => api.get<CircularRecord>(`/circulars/${id}`),

  create: (body: CreateCircularInput) => api.post<CircularRecord>('/circulars', body),

  update: (id: string, body: Partial<CreateCircularInput>) =>
    api.patch<CircularRecord>(`/circulars/${id}`, body),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/circulars/${id}`),
}
