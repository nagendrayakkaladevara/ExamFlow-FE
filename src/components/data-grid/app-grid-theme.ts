import { themeQuartz } from 'ag-grid-community'

const sharedGridParams = {
  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
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

/** AG Grid theme aligned with index.css tokens (Inter, neutral palette, 48px rows). */
export const appGridTheme = themeQuartz
  .withParams(
    {
      ...sharedGridParams,
      foregroundColor: 'oklch(0.145 0 0)',
      backgroundColor: 'oklch(1 0 0)',
      borderColor: 'oklch(0.922 0 0)',
      headerBackgroundColor: 'oklch(1 0 0)',
      headerTextColor: 'oklch(0.556 0 0)',
      rowHoverColor: 'oklch(0.97 0 0)',
      selectedRowBackgroundColor: 'oklch(0.97 0 0)',
      accentColor: 'oklch(0.205 0 0)',
      rowBorder: { width: 1, style: 'solid', color: 'oklch(0.922 0 0)' },
      browserColorScheme: 'light',
    },
    'light',
  )
  .withParams(
    {
      ...sharedGridParams,
      foregroundColor: 'oklch(0.985 0 0)',
      backgroundColor: 'oklch(0.145 0 0)',
      borderColor: 'oklch(1 0 0 / 10%)',
      headerBackgroundColor: 'oklch(0.205 0 0)',
      headerTextColor: 'oklch(0.708 0 0)',
      rowHoverColor: 'oklch(0.269 0 0)',
      selectedRowBackgroundColor: 'oklch(0.269 0 0)',
      accentColor: 'oklch(0.922 0 0)',
      rowBorder: { width: 1, style: 'solid', color: 'oklch(1 0 0 / 10%)' },
      browserColorScheme: 'dark',
    },
    'dark',
  )
