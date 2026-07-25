import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ColorTheme = 'default' | 'claude' | 'tangerine'

const STORAGE_KEY = 'color-theme'

const ColorThemeContext = createContext<{
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
} | null>(null)

function applyColorTheme(theme: ColorTheme) {
  if (theme === 'default') {
    delete document.documentElement.dataset.colorTheme
  } else {
    document.documentElement.dataset.colorTheme = theme
  }
}

function readStoredColorTheme(): ColorTheme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'claude' || stored === 'tangerine') return stored
  return 'default'
}

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => readStoredColorTheme())

  useEffect(() => {
    applyColorTheme(colorTheme)
    localStorage.setItem(STORAGE_KEY, colorTheme)
  }, [colorTheme])

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme)
  }, [])

  const value = useMemo(
    () => ({ colorTheme, setColorTheme }),
    [colorTheme, setColorTheme],
  )

  return (
    <ColorThemeContext.Provider value={value}>{children}</ColorThemeContext.Provider>
  )
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext)
  if (!context) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider')
  }
  return context
}
