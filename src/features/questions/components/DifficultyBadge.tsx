import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DifficultyLevel } from '@/types/enums'

const difficultyConfig: Record<DifficultyLevel, { label: string; className: string }> = {
  EASY: {
    label: 'Easy',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  MEDIUM: {
    label: 'Medium',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  },
  HARD: {
    label: 'Hard',
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300',
  },
}

export function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const config = difficultyConfig[difficulty]

  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
