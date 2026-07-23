import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { analyticsApi } from '@/features/analytics/api'
import { triggerCsvDownload } from '@/features/analytics/utils/download-csv'
import { isApiError } from '@/lib/errors'

interface ExportCsvButtonProps {
  label?: string
  filename: string
  onExport: () => Promise<Blob>
  variant?: 'default' | 'outline' | 'secondary'
}

export function ExportCsvButton({
  label = 'Export CSV',
  filename,
  onExport,
  variant = 'outline',
}: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await onExport()
      triggerCsvDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
      toast.success('Export downloaded.')
    } catch (error) {
      toast.error(isApiError(error) ? error.message : 'Unable to export data.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button type="button" variant={variant} disabled={isExporting} onClick={() => void handleExport()}>
      {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {label}
    </Button>
  )
}

export function AssignmentExportButton({
  assignmentId,
  title,
}: {
  assignmentId: string
  title: string
}) {
  const safeName = title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()

  return (
    <ExportCsvButton
      label="Export results"
      filename={`${safeName || assignmentId}-results.csv`}
      onExport={() => analyticsApi.exportAssignmentCsv(assignmentId)}
    />
  )
}
