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
  AssignmentCreatePage,
  AssignmentDetailPage,
  AssignmentResultPage,
  AssignmentsPage,
  ChangePasswordPage,
  CircularDetailPage,
  CircularFormPage,
  CircularsPage,
  ClassDetailPage,
  ClassesPage,
  PollDetailPage,
  PollFormPage,
  PollsPage,
  QuestionFormPage,
  QuestionsPage,
  RoleDashboardPage,
  SettingsPage,
  TakeAssignmentPage,
  UserCreatePage,
  UserDetailPage,
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
        path: '/account/settings',
        element: <AppShell />,
        children: [{ index: true, element: <SettingsPage /> }],
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
              { path: 'users/new', element: <UserCreatePage /> },
              { path: 'users/:id', element: <UserDetailPage /> },
              { path: 'classes', element: <ClassesPage /> },
              { path: 'classes/:id', element: <ClassDetailPage /> },
              { path: 'analytics', element: <AnalyticsPage /> },
              { path: 'circulars', element: <CircularsPage /> },
              { path: 'circulars/new', element: <CircularFormPage /> },
              { path: 'circulars/:id', element: <CircularDetailPage /> },
              { path: 'polls', element: <PollsPage /> },
              { path: 'polls/new', element: <PollFormPage /> },
              { path: 'polls/:id', element: <PollDetailPage /> },
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
              { path: 'questions/new', element: <QuestionFormPage /> },
              { path: 'questions/:id/edit', element: <QuestionFormPage /> },
              { path: 'assignments', element: <AssignmentsPage /> },
              { path: 'assignments/new', element: <AssignmentCreatePage /> },
              { path: 'assignments/:id', element: <AssignmentDetailPage /> },
              { path: 'analytics', element: <AnalyticsPage /> },
              { path: 'circulars', element: <CircularsPage /> },
              { path: 'circulars/new', element: <CircularFormPage /> },
              { path: 'circulars/:id', element: <CircularDetailPage /> },
              { path: 'polls', element: <PollsPage /> },
              { path: 'polls/new', element: <PollFormPage /> },
              { path: 'polls/:id', element: <PollDetailPage /> },
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
              { path: 'assignments/:id', element: <AssignmentDetailPage /> },
              { path: 'assignments/:id/result', element: <AssignmentResultPage /> },
              { path: 'analytics', element: <AnalyticsPage /> },
              { path: 'circulars', element: <CircularsPage /> },
              { path: 'circulars/:id', element: <CircularDetailPage /> },
              { path: 'polls', element: <PollsPage /> },
              { path: 'polls/:id', element: <PollDetailPage /> },
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
