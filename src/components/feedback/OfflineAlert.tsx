import { WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineAlert() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 p-4">
      <Alert variant="destructive" className="mx-auto max-w-lg shadow-md">
        <WifiOff />
        <AlertDescription>You're offline.</AlertDescription>
      </Alert>
    </div>
  )
}
