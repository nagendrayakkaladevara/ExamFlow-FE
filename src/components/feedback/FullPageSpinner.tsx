import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <LoadingSpinner size="lg" />
    </div>
  )
}
