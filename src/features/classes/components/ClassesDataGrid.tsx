import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { MoreHorizontal } from 'lucide-react'
import { AppDataGrid } from '@/components/data-grid/AppDataGrid'
import { ActiveBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/format'
import type { ClassRecord } from '@/types/domain'

interface ClassesDataGridProps {
  classes: ClassRecord[]
  loading?: boolean
  basePath: string
}

function ClassNameCell({ data }: ICellRendererParams<ClassRecord>) {
  if (!data) return null

  return (
    <div className="flex min-w-0 items-center py-1">
      <span className="truncate text-sm font-medium" title={data.name}>
        {data.name}
      </span>
    </div>
  )
}

function StatusCell({ data }: ICellRendererParams<ClassRecord>) {
  if (!data) return null

  return (
    <div className="flex h-full items-center py-1">
      <ActiveBadge active={data.isActive} />
    </div>
  )
}

function ActionsCell({
  data,
  onView,
}: ICellRendererParams<ClassRecord> & {
  onView: (classId: string) => void
}) {
  if (!data) return null

  return (
    <div className="flex h-full items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8"
            aria-label={`Actions for ${data.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(data.id)}>View</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ClassesDataGrid({ classes, loading, basePath }: ClassesDataGridProps) {
  const navigate = useNavigate()

  const handleView = useMemo(
    () => (classId: string) => {
      navigate(`${basePath}/classes/${classId}`)
    },
    [basePath, navigate],
  )

  const columnDefs = useMemo<ColDef<ClassRecord>[]>(
    () => [
      {
        headerName: 'Name',
        field: 'name',
        flex: 2,
        minWidth: 200,
        cellRenderer: ClassNameCell,
        tooltipValueGetter: (params) => params.data?.name ?? '',
      },
      {
        headerName: 'Code',
        field: 'code',
        width: 120,
        valueFormatter: (params) => params.value ?? '—',
      },
      {
        headerName: 'Status',
        field: 'isActive',
        width: 110,
        sortable: false,
        cellRenderer: StatusCell,
      },
      {
        headerName: 'Updated',
        field: 'updatedAt',
        width: 130,
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        headerName: '',
        colId: 'actions',
        width: 72,
        maxWidth: 72,
        sortable: false,
        resizable: false,
        pinned: 'right',
        cellRenderer: ActionsCell,
        cellRendererParams: { onView: handleView },
      },
    ],
    [basePath, handleView],
  )

  return (
    <AppDataGrid
      rowData={classes}
      columnDefs={columnDefs}
      loading={loading}
      getRowId={({ data }) => data.id}
      height="min(70vh, 640px)"
    />
  )
}
