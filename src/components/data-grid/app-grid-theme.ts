import { themeQuartz } from 'ag-grid-community'

/** AG Grid theme aligned with design.md tokens (Inter, neutral palette, 48px rows). */
export const appGridTheme = themeQuartz.withParams({
  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
  fontSize: 14,
  headerFontSize: 12,
  headerFontWeight: 500,
  foregroundColor: 'oklch(0.145 0 0)',
  backgroundColor: 'oklch(1 0 0)',
  borderColor: 'oklch(0.922 0 0)',
  headerBackgroundColor: 'oklch(1 0 0)',
  headerTextColor: 'oklch(0.556 0 0)',
  rowHoverColor: 'oklch(0.97 0 0)',
  selectedRowBackgroundColor: 'oklch(0.97 0 0)',
  accentColor: 'oklch(0.205 0 0)',
  rowHeight: 48,
  borderRadius: 6,
  wrapperBorder: false,
  headerColumnBorder: false,
  columnBorder: false,
  rowBorder: { width: 1, style: 'solid', color: 'oklch(0.922 0 0)' },
  cellHorizontalPadding: 16,
})
