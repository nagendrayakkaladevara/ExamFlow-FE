import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ColorThemeProvider } from '@/components/theme/color-theme-provider'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { FullPageSpinner } from '@/components/feedback/FullPageSpinner'
import { OfflineAlert } from '@/components/feedback/OfflineAlert'
import { createQueryClient } from '@/lib/query-client'
import { useBootstrapAuth, useSessionExpiryHandler } from '@/features/auth/hooks'
import { router } from '@/app/router'
import { useAuthStore } from '@/features/auth/store'

const queryClient = createQueryClient()

function AuthBootstrap({ children }: { children: ReactNode }) {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped)
  useBootstrapAuth()
  useSessionExpiryHandler()

  if (!isBootstrapped) {
    return <FullPageSpinner />
  }

  return children
}

export function AppProviders() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ColorThemeProvider>
            <TooltipProvider>
              <AuthBootstrap>
                <RouterProvider router={router} />
              </AuthBootstrap>
              <OfflineAlert />
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
