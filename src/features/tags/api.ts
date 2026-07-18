import { api } from '@/lib/api-client'
import type { TagRecord } from '@/types/domain'

export const tagsApi = {
  list: () => api.get<TagRecord[]>('/tags'),

  create: (name: string) => api.post<TagRecord>('/tags', { name }),

  update: (id: string, name: string) => api.patch<TagRecord>(`/tags/${id}`, { name }),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/tags/${id}`),
}
