import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { useEffect, type ReactNode } from 'react'

function AgGridThemeModeSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const mode = resolvedTheme === 'light' ? 'light' : 'dark'
    document.documentElement.dataset.agThemeMode = mode
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AgGridThemeModeSync />
      {children}
    </NextThemesProvider>
  )
}
