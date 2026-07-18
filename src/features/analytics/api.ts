import { api } from '@/lib/api-client'
import type {
  AdminOverview,
  LecturerAssignmentAnalytics,
  LecturerClassAnalytics,
  StudentAnalytics,
} from '@/types/domain'

export const analyticsApi = {
  studentMe: () => api.get<StudentAnalytics>('/analytics/student/me'),

  lecturerClass: (classId: string) =>
    api.get<LecturerClassAnalytics>(`/analytics/lecturer/classes/${classId}`),

  lecturerAssignment: (assignmentId: string) =>
    api.get<LecturerAssignmentAnalytics>(
      `/analytics/lecturer/assignments/${assignmentId}`,
    ),

  adminOverview: () => api.get<AdminOverview>('/analytics/admin/overview'),
}
