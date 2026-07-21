import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RefreshButtonProps {
  onClick: () => void
  isRefreshing?: boolean
  className?: string
}

export function RefreshButton({ onClick, isRefreshing, className }: RefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={isRefreshing}
      className={className}
    >
      <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
      Refresh
    </Button>
  )
}
