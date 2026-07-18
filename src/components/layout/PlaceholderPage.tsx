import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Module scaffold ready</CardTitle>
          <CardDescription>
            This page is wired into routing and role guards. Implement feature logic in{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">features/</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect TanStack Query hooks and shadcn forms/tables per the architecture guide.
        </CardContent>
      </Card>
    </div>
  )
}
