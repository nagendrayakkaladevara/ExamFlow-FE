import { PlaceholderPage } from '@/components/layout/PlaceholderPage'
import { useAuthStore } from '@/features/auth/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RoleDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          user
            ? `Welcome back, ${user.firstName}. Your role is ${user.role.toLowerCase()}.`
            : undefined
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the sidebar to navigate modules. API integration is configured via the secure
          client in <code className="rounded bg-muted px-1 py-0.5 text-xs">lib/api-client.ts</code>.
        </CardContent>
      </Card>
    </div>
  )
}

export function UsersPage() {
  return (
    <PlaceholderPage
      title="Users"
      description="Create and manage lecturers and students."
    />
  )
}

export function ClassesPage() {
  return (
    <PlaceholderPage
      title="Classes"
      description="Manage classes and assign lecturers and students."
    />
  )
}

export function TagsPage() {
  return (
    <PlaceholderPage title="Tags" description="Organize questions with tags." />
  )
}

export function QuestionsPage() {
  return (
    <PlaceholderPage
      title="Question Bank"
      description="Create and manage assessment questions."
    />
  )
}

export function AssignmentsPage() {
  return (
    <PlaceholderPage
      title="Assignments"
      description="Create, assign, and review assessments."
    />
  )
}

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Role-scoped performance insights."
    />
  )
}

export function CircularsPage() {
  return (
    <PlaceholderPage title="Circulars" description="Institution announcements." />
  )
}

export function PollsPage() {
  return (
    <PlaceholderPage title="Polls" description="Create and participate in polls." />
  )
}

export function TakeAssignmentPage() {
  return (
    <PlaceholderPage
      title="Take Assignment"
      description="Focused exam layout without sidebar chrome."
    />
  )
}

export function ChangePasswordPage() {
  return (
    <PlaceholderPage
      title="Change Password"
      description="Update your account password."
    />
  )
}
