export const queryKeys = {
  auth: {
    bootstrap: ['auth', 'bootstrap'] as const,
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
  },
  classes: {
    all: ['classes'] as const,
    list: (params?: Record<string, unknown>) => ['classes', 'list', params] as const,
    detail: (id: string) => ['classes', 'detail', id] as const,
    lecturers: (id: string) => ['classes', id, 'lecturers'] as const,
    students: (id: string) => ['classes', id, 'students'] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
  questions: {
    all: ['questions'] as const,
    list: (params?: Record<string, unknown>) => ['questions', 'list', params] as const,
  },
  assignments: {
    all: ['assignments'] as const,
    list: (params?: Record<string, unknown>) => ['assignments', 'list', params] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    studentMe: (params?: Record<string, unknown>) =>
      ['analytics', 'student', 'me', params] as const,
    studentByTag: (params?: Record<string, unknown>) =>
      ['analytics', 'student', 'by-tag', params] as const,
    lecturerSummary: (params?: Record<string, unknown>) =>
      ['analytics', 'lecturer', 'summary', params] as const,
    lecturerClass: (classId: string, params?: Record<string, unknown>) =>
      ['analytics', 'lecturer', 'class', classId, params] as const,
    lecturerAssignment: (assignmentId: string, params?: Record<string, unknown>) =>
      ['analytics', 'lecturer', 'assignment', assignmentId, params] as const,
    lecturerAssignmentQuestions: (assignmentId: string) =>
      ['analytics', 'lecturer', 'assignment', assignmentId, 'questions'] as const,
    adminOverview: (params?: Record<string, unknown>) =>
      ['analytics', 'admin', 'overview', params] as const,
    adminClass: (classId: string, params?: Record<string, unknown>) =>
      ['analytics', 'admin', 'class', classId, params] as const,
    adminActivity: (params?: Record<string, unknown>) =>
      ['analytics', 'admin', 'activity', params] as const,
    adminTrends: (params: Record<string, unknown>) =>
      ['analytics', 'admin', 'trends', params] as const,
    adminAlerts: (params?: Record<string, unknown>) =>
      ['analytics', 'admin', 'alerts', params] as const,
    /** @deprecated Use specific analytics keys instead */
    dashboard: (scope?: string) => ['analytics', 'dashboard', scope] as const,
  },
  circulars: {
    all: ['circulars'] as const,
  },
  polls: {
    all: ['polls'] as const,
  },
} as const
