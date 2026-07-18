import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AuthGuard, GuestGuard } from '@/components/guards/AuthGuard'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { AppShell, ExamLayout, PublicLayout } from '@/components/layout/AppShell'
import { FullPageSpinner } from '@/components/feedback/FullPageSpinner'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { RootRedirect } from '@/pages/RootRedirect'
import {
  AnalyticsPage,
  AssignmentsPage,
  ChangePasswordPage,
  CircularsPage,
  ClassesPage,
  PollsPage,
  QuestionsPage,
  RoleDashboardPage,
  TagsPage,
  TakeAssignmentPage,
  UsersPage,
} from '@/pages'

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<FullPageSpinner />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <PublicLayout />,
    children: [
      {
        element: <GuestGuard />,
        children: [
          {
            path: '/login',
            element: withSuspense(<LoginPage />),
          },
        ],
      },
    ],
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/account/password',
        element: <AppShell />,
        children: [{ index: true, element: <ChangePasswordPage /> }],
      },
      {
        path: '/admin',
        element: <RoleGuard allowedRoles={['ADMIN']} />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <RoleDashboardPage /> },
              { path: 'users', element: <UsersPage /> },
              { path: 'classes', element: <ClassesPage /> },
              { path: 'analytics', element: <AnalyticsPage /> },
              { path: 'circulars', element: <CircularsPage /> },
              { path: 'polls', element: <PollsPage /> },
            ],
          },
        ],
      },
      {
        path: '/lecturer',
        element: <RoleGuard allowedRoles={['LECTURER']} />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <RoleDashboardPage /> },
              { path: 'questions', element: <QuestionsPage /> },
              { path: 'tags', element: <TagsPage /> },
              { path: 'assignments', element: <AssignmentsPage /> },
              { path: 'analytics', element: <AnalyticsPage /> },
              { path: 'circulars', element: <CircularsPage /> },
              { path: 'polls', element: <PollsPage /> },
            ],
          },
        ],
      },
      {
        path: '/student',
        element: <RoleGuard allowedRoles={['STUDENT']} />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <RoleDashboardPage /> },
              { path: 'assignments', element: <AssignmentsPage /> },
              { path: 'circulars', element: <CircularsPage /> },
              { path: 'polls', element: <PollsPage /> },
            ],
          },
          {
            path: 'assignments/:id/take',
            element: <ExamLayout />,
            children: [{ index: true, element: <TakeAssignmentPage /> }],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
