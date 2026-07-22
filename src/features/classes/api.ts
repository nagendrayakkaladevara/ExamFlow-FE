import { api } from '@/lib/api-client'
import type { ClassMember, ClassRecord } from '@/types/domain'

export interface ListClassesParams {
  isActive?: boolean
  limit?: number
  cursor?: string
}

export interface CreateClassInput {
  name: string
  code?: string | null
  description?: string | null
}

export interface UpdateClassInput {
  name?: string
  code?: string | null
  description?: string | null
  isActive?: boolean
}

export const classesApi = {
  list: (params?: ListClassesParams) =>
    api.getList<ClassRecord>('/classes', {
      params: params as Record<string, string | number | boolean | null | undefined>,
    }),

  get: (id: string) => api.get<ClassRecord>(`/classes/${id}`),

  create: (body: CreateClassInput) => api.post<ClassRecord>('/classes', body),

  update: (id: string, body: UpdateClassInput) =>
    api.patch<ClassRecord>(`/classes/${id}`, body),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/classes/${id}`),

  assignLecturer: (classId: string, userId: string) =>
    api.post<{ assigned: boolean }>(`/classes/${classId}/lecturers`, { userId }),

  enrollStudent: (classId: string, userId: string) =>
    api.post<{ enrolled: boolean }>(`/classes/${classId}/students`, { userId }),

  unassignLecturer: (classId: string, userId: string) =>
    api.delete<{ unassigned: boolean }>(`/classes/${classId}/lecturers/${userId}`),

  unassignStudent: (classId: string, userId: string) =>
    api.delete<{ unassigned: boolean }>(`/classes/${classId}/students/${userId}`),

  listAssigned: () => api.get<ClassRecord[]>('/classes/assigned'),

  listEnrolled: () => api.get<ClassRecord[]>('/classes/enrolled'),

  listLecturers: (classId: string) =>
    api.get<ClassMember[]>(`/classes/${classId}/lecturers`),

  listStudents: (classId: string) =>
    api.get<ClassMember[]>(`/classes/${classId}/students`),
}
