import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg'

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
}

interface LoadingSpinnerProps {
  className?: string
  size?: SpinnerSize
  label?: string
}

export function LoadingSpinner({
  className,
  size = 'md',
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(spinnerSizes[size], 'animate-spin text-muted-foreground', className)}
      aria-label={label}
    />
  )
}

interface LoadingStateProps {
  className?: string
  spinnerClassName?: string
  size?: SpinnerSize
  minHeightClassName?: string
  label?: string
}

export function LoadingState({
  className,
  spinnerClassName,
  size = 'md',
  minHeightClassName = 'min-h-48',
  label,
}: LoadingStateProps) {
  return (
    <div
      className={cn('flex items-center justify-center', minHeightClassName, className)}
      role="status"
    >
      <LoadingSpinner className={spinnerClassName} size={size} label={label} />
    </div>
  )
}
