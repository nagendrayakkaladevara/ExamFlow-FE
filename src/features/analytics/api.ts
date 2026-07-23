import { api } from '@/lib/api-client'
import type {
  ActivityFeed,
  AdminAlert,
  AdminClassAnalytics,
  AdminOverview,
  AdminTrends,
  AnalyticsDateParams,
  AssignmentQuestionAnalytics,
  AssignmentRosterParams,
  LecturerAssignmentAnalytics,
  LecturerClassAnalytics,
  LecturerSummary,
  StudentAnalytics,
  StudentTagAnalytics,
} from '@/types/domain'

type QueryParams = Record<string, string | number | boolean | undefined | null>

function toQueryParams<T extends object>(params?: T): QueryParams | undefined {
  return params as QueryParams | undefined
}

export const analyticsApi = {
  studentMe: (params?: AnalyticsDateParams) =>
    api.get<StudentAnalytics>('/analytics/student/me', { params: toQueryParams(params) }),

  studentByTag: (params?: AnalyticsDateParams) =>
    api.get<StudentTagAnalytics>('/analytics/student/me/by-tag', {
      params: toQueryParams(params),
    }),

  lecturerSummary: (params?: AnalyticsDateParams) =>
    api.get<LecturerSummary>('/analytics/lecturer/summary', { params: toQueryParams(params) }),

  lecturerClass: (classId: string, params?: AnalyticsDateParams) =>
    api.get<LecturerClassAnalytics>(`/analytics/lecturer/classes/${classId}`, {
      params: toQueryParams(params),
    }),

  lecturerAssignment: (assignmentId: string, params?: AssignmentRosterParams) =>
    api.get<LecturerAssignmentAnalytics>(
      `/analytics/lecturer/assignments/${assignmentId}`,
      { params: toQueryParams(params) },
    ),

  lecturerAssignmentQuestions: (assignmentId: string) =>
    api.get<AssignmentQuestionAnalytics[]>(
      `/analytics/lecturer/assignments/${assignmentId}/questions`,
    ),

  exportAssignmentCsv: (assignmentId: string) =>
    api.downloadBlob(`/analytics/lecturer/assignments/${assignmentId}/export`, {
      params: { format: 'csv' },
    }),

  adminOverview: (params?: AnalyticsDateParams) =>
    api.get<AdminOverview>('/analytics/admin/overview', { params: toQueryParams(params) }),

  adminClass: (classId: string, params?: AnalyticsDateParams) =>
    api.get<AdminClassAnalytics>(`/analytics/admin/classes/${classId}`, {
      params: toQueryParams(params),
    }),

  adminActivity: (params?: { limit?: number; cursor?: string }) =>
    api.get<ActivityFeed>('/analytics/admin/activity', { params: toQueryParams(params) }),

  adminTrends: (params: {
    metric: AdminTrends['metric']
    interval: AdminTrends['interval']
    from: string
    to: string
  }) => api.get<AdminTrends>('/analytics/admin/trends', { params: toQueryParams(params) }),

  adminAlerts: (params?: { threshold?: number }) =>
    api.get<AdminAlert[]>('/analytics/admin/alerts', { params: toQueryParams(params) }),

  exportAdminReport: (
    reportType: string,
    params?: Record<string, string | number | undefined>,
  ) =>
    api.downloadBlob(`/analytics/admin/reports/${reportType}/export`, {
      params: { format: 'csv', ...params } as QueryParams,
    }),
}
