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
    dashboard: (scope?: string) => ['analytics', 'dashboard', scope] as const,
  },
  circulars: {
    all: ['circulars'] as const,
  },
  polls: {
    all: ['polls'] as const,
  },
} as const
