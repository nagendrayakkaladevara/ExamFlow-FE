import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <FileQuestion className="mx-auto size-10 text-muted-foreground" />
          <CardTitle>404 — Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
