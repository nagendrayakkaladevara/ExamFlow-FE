import { cn } from '@/lib/utils'

interface InstitutionLogoProps {
  className?: string
}

export function InstitutionLogo({ className }: InstitutionLogoProps) {
  return (
    <img
      src="/svecw-logo.webp"
      alt="Shri Vishnu Engineering College for Women"
      className={cn('h-10 w-auto shrink-0 rounded-md object-contain', className)}
    />
  )
}
