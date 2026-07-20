import { AgGridReact } from 'ag-grid-react'
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridOptions,
  type GridReadyEvent,
} from 'ag-grid-community'
import { appGridTheme } from '@/components/data-grid/app-grid-theme'
import '@/components/data-grid/app-grid-overrides.css'
import { cn } from '@/lib/utils'

ModuleRegistry.registerModules([AllCommunityModule])

interface AppDataGridProps<TData> {
  rowData: TData[]
  columnDefs: ColDef<TData>[]
  className?: string
  height?: number | string
  loading?: boolean
  getRowId?: (params: { data: TData }) => string
  onGridReady?: (event: GridReadyEvent<TData>) => void
  gridOptions?: GridOptions<TData>
}

export function AppDataGrid<TData>({
  rowData,
  columnDefs,
  className,
  height = 520,
  loading = false,
  getRowId,
  onGridReady,
  gridOptions,
}: AppDataGridProps<TData>) {
  return (
    <div
      className={cn('w-full overflow-hidden rounded-lg border', className)}
      style={{ height }}
    >
      <AgGridReact<TData>
        theme={appGridTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          resizable: true,
          suppressMovable: true,
        }}
        loading={loading}
        getRowId={getRowId}
        onGridReady={onGridReady}
        suppressCellFocus
        animateRows={false}
        headerHeight={40}
        tooltipShowDelay={400}
        overlayNoRowsTemplate='<span class="text-sm text-muted-foreground">No rows to show</span>'
        {...gridOptions}
      />
    </div>
  )
}
