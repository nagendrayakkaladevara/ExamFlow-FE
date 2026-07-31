import { useEffect, useRef, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

const ONLINE_ALERT_DURATION_MS = 4000

export function OfflineAlert() {
  const isOnline = useOnlineStatus()
  const [showOnlineAlert, setShowOnlineAlert] = useState(false)
  const wasOfflineRef = useRef(false)

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true
      setShowOnlineAlert(false)
      return
    }

    if (!wasOfflineRef.current) {
      return
    }

    wasOfflineRef.current = false
    setShowOnlineAlert(true)

    const timer = window.setTimeout(() => {
      setShowOnlineAlert(false)
    }, ONLINE_ALERT_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [isOnline])

  if (!isOnline) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 p-4">
        <Alert variant="destructive" className="mx-auto max-w-lg shadow-md">
          <WifiOff />
          <AlertDescription>You're offline.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!showOnlineAlert) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 p-4">
      <Alert className="mx-auto max-w-lg border-green-500/50 bg-green-500/10 text-green-700 shadow-md dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
        <Wifi />
        <AlertDescription>You're back online.</AlertDescription>
      </Alert>
    </div>
  )
}
