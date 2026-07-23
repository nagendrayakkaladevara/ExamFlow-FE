import { RefreshCw } from 'lucide-react'
import { type VariantProps } from 'class-variance-authority'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RefreshButtonProps {
  onClick: () => void
  isRefreshing?: boolean
  className?: string
  size?: VariantProps<typeof buttonVariants>['size']
}

export function RefreshButton({
  onClick,
  isRefreshing,
  className,
  size,
}: RefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={isRefreshing}
      className={className}
    >
      <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
      Refresh
    </Button>
  )
}
