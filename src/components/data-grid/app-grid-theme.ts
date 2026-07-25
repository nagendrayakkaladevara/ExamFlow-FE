import { themeQuartz } from 'ag-grid-community'

const sharedGridParams = {
  fontSize: 14,
  headerFontSize: 12,
  headerFontWeight: 500,
  rowHeight: 48,
  borderRadius: 6,
  wrapperBorder: false,
  headerColumnBorder: false,
  columnBorder: false,
  cellHorizontalPadding: 16,
} as const

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Builds an AG Grid theme from the active CSS variables on document.documentElement. */
export function createAppGridTheme() {
  const fontFamily = getCssVar('--font-sans') || "'Inter', ui-sans-serif, system-ui, sans-serif"
  const foregroundColor = getCssVar('--foreground')
  const backgroundColor = getCssVar('--background')
  const borderColor = getCssVar('--border')
  const cardColor = getCssVar('--card')
  const mutedForeground = getCssVar('--muted-foreground')
  const hoverColor = getCssVar('--muted')
  const primaryColor = getCssVar('--primary')
  const isDark = document.documentElement.classList.contains('dark')

  return themeQuartz.withParams({
    ...sharedGridParams,
    fontFamily,
    foregroundColor,
    backgroundColor,
    borderColor,
    headerBackgroundColor: cardColor,
    headerTextColor: mutedForeground,
    rowHoverColor: hoverColor,
    selectedRowBackgroundColor: hoverColor,
    accentColor: primaryColor,
    rowBorder: { width: 1, style: 'solid', color: borderColor },
    browserColorScheme: isDark ? 'dark' : 'light',
  })
}
