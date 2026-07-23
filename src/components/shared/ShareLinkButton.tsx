import { useCallback } from 'react'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { type VariantProps } from 'class-variance-authority'
import { Button, buttonVariants } from '@/components/ui/button'

interface ShareLinkButtonProps {
  url: string
  title?: string
  className?: string
  size?: VariantProps<typeof buttonVariants>['size']
}

export function ShareLinkButton({ url, title, className, size }: ShareLinkButtonProps) {
  const handleShare = useCallback(async () => {
    const shareData = title ? { title, url } : { url }

    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData)
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied.')
    } catch {
      toast.error('Unable to copy link.')
    }
  }, [url, title])

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleShare}
      className={className}
    >
      <Share2 className="size-4" />
      Share
    </Button>
  )
}
