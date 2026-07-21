import { useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community'
import { MoreHorizontal } from 'lucide-react'
import { AppDataGrid } from '@/components/data-grid/AppDataGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DifficultyBadge } from '@/features/questions/components/DifficultyBadge'
import { formatDate } from '@/lib/format'
import type { QuestionRecord } from '@/types/domain'

interface QuestionsDataGridProps {
  questions: QuestionRecord[]
  loading?: boolean
  onView: (questionId: string) => void
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

function formatLabel(value: string): string {
  const formatted = value.replaceAll('_', ' ').toLowerCase()
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function QuestionTitleCell({ data }: ICellRendererParams<QuestionRecord>) {
  if (!data) return null

  return (
    <div className="flex min-w-0 items-center py-1">
      <span className="truncate text-sm font-medium" title={data.title}>
        {data.title}
      </span>
    </div>
  )
}

function DifficultyCell({ data }: ICellRendererParams<QuestionRecord>) {
  if (!data?.difficulty) return null

  return (
    <div className="flex h-full items-center py-1">
      <DifficultyBadge difficulty={data.difficulty} />
    </div>
  )
}

function TagsCell({ data }: ICellRendererParams<QuestionRecord>) {
  const tags = data?.tags ?? []
  if (tags.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden py-1">
      {tags.slice(0, 2).map((tag) => (
        <Badge key={tag.id} variant="secondary" className="max-w-24 shrink-0 truncate">
          {tag.name}
        </Badge>
      ))}
      {tags.length > 2 ? (
        <span className="shrink-0 text-xs text-muted-foreground">+{tags.length - 2}</span>
      ) : null}
    </div>
  )
}

function ActionsCell({
  data,
  onView,
}: ICellRendererParams<QuestionRecord> & { onView: (questionId: string) => void }) {
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
            aria-label={`Actions for ${data.title || 'question'}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(data.id)}>View</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/lecturer/questions/${data.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function QuestionsDataGrid({
  questions,
  loading,
  onView,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: QuestionsDataGridProps) {
  const gridApiRef = useRef<GridApi<QuestionRecord> | null>(null)
  const isSyncingRef = useRef(false)
  const selectedIdsRef = useRef(selectedIds)

  selectedIdsRef.current = selectedIds

  const syncSelection = useCallback((api: GridApi<QuestionRecord>) => {
    isSyncingRef.current = true
    const selectedSet = new Set(selectedIdsRef.current)
    api.forEachNode((node) => {
      if (!node.data) return
      node.setSelected(selectedSet.has(node.data.id))
    })
    isSyncingRef.current = false
  }, [])

  const handleGridReady = useCallback(
    (event: GridReadyEvent<QuestionRecord>) => {
      gridApiRef.current = event.api
      if (selectable) {
        syncSelection(event.api)
      }
    },
    [selectable, syncSelection],
  )

  const handleSelectionChanged = useCallback(() => {
    if (!selectable || !onSelectionChange || !gridApiRef.current || isSyncingRef.current) {
      return
    }

    const visibleSelectedIds = gridApiRef.current
      .getSelectedRows()
      .map((row) => row.id)
    const visibleIds = new Set(questions.map((question) => question.id))
    const hiddenSelectedIds = selectedIdsRef.current.filter((id) => !visibleIds.has(id))

    onSelectionChange([...hiddenSelectedIds, ...visibleSelectedIds])
  }, [onSelectionChange, questions, selectable])

  const columnDefs = useMemo<ColDef<QuestionRecord>[]>(
    () => [
      {
        headerName: 'Question',
        field: 'title',
        flex: 2,
        minWidth: 240,
        cellRenderer: QuestionTitleCell,
        tooltipValueGetter: (params) => params.data?.title ?? '',
      },
      {
        headerName: 'Type',
        field: 'type',
        width: 130,
        valueFormatter: (params) => formatLabel(params.value ?? ''),
      },
      {
        headerName: 'Difficulty',
        field: 'difficulty',
        width: 120,
        sortable: false,
        cellRenderer: DifficultyCell,
      },
      {
        headerName: 'Marks',
        field: 'defaultMarks',
        width: 90,
        type: 'numericColumn',
      },
      {
        headerName: 'Tags',
        field: 'tags',
        flex: 1,
        minWidth: 140,
        sortable: false,
        cellRenderer: TagsCell,
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
        cellRendererParams: { onView },
      },
    ],
    [onView],
  )

  return (
    <AppDataGrid
      rowData={questions}
      columnDefs={columnDefs}
      loading={loading}
      getRowId={({ data }) => data.id}
      height="min(70vh, 640px)"
      onGridReady={handleGridReady}
      gridOptions={
        selectable
          ? {
              rowSelection: {
                mode: 'multiRow',
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: true,
              },
              onSelectionChanged: handleSelectionChanged,
              onRowDataUpdated: (event) => {
                if (selectable) {
                  syncSelection(event.api)
                }
              },
            }
          : undefined
      }
    />
  )
}
