import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usersApi, type BulkImportResult } from '@/features/users/api'
import {
  downloadStudentImportTemplate,
  parseStudentSpreadsheet,
  type ParsedStudentRow,
} from '@/features/users/utils/parseStudentSpreadsheet'
import { isApiError } from '@/lib/errors'

const MAX_ROWS = 200

export function StudentBulkImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [rows, setRows] = useState<ParsedStudentRow[]>([])
  const [defaultPassword, setDefaultPassword] = useState('')
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      usersApi.bulkCreate({
        students: rows.map(({ firstName, lastName, email, password }) => ({
          firstName,
          lastName,
          email,
          ...(password ? { password } : {}),
        })),
        ...(defaultPassword ? { defaultPassword } : {}),
      }),
    onSuccess: (result) => {
      setImportResult(result)
      toast.success(`Imported ${result.summary.created} of ${result.summary.total} students.`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to import students.')
    },
  })

  const rowsMissingPassword = rows.filter((row) => !row.password).length
  const canImport =
    rows.length > 0 &&
    parseErrors.length === 0 &&
    (rowsMissingPassword === 0 || defaultPassword.length >= 8)

  async function handleFileChange(file: File | null) {
    setImportResult(null)
    if (!file) {
      setFileName(null)
      setRows([])
      setParseErrors([])
      return
    }

    setFileName(file.name)

    try {
      const result = await parseStudentSpreadsheet(file)
      setRows(result.rows.slice(0, MAX_ROWS))
      setParseErrors([
        ...result.errors,
        ...(result.rows.length > MAX_ROWS
          ? [`Only the first ${MAX_ROWS} rows will be imported.`]
          : []),
      ])
    } catch {
      setRows([])
      setParseErrors(['Unable to read the spreadsheet. Use an .xlsx or .xls file.'])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-lg border border-dashed p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Upload Excel file</p>
                <p className="text-sm text-muted-foreground">
                  Required columns: firstName, lastName, email. Password is optional if you set a
                  default below.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={downloadStudentImportTemplate}>
                  <Download className="size-4" />
                  Download template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Choose file
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                void handleFileChange(file)
                event.target.value = ''
              }}
            />
            {fileName ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="size-4" />
                {fileName}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultPassword">Default password (optional)</Label>
            <PasswordInput
              id="defaultPassword"
              value={defaultPassword}
              onChange={(event) => setDefaultPassword(event.target.value)}
              placeholder="Used when a row has no password column"
            />
            <p className="text-xs text-muted-foreground">
              {rowsMissingPassword > 0
                ? `${rowsMissingPassword} row(s) need this default password.`
                : 'Leave blank if every row includes its own password.'}
            </p>
          </div>

          {parseErrors.length > 0 ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <ul className="list-disc space-y-1 pl-5">
                {parseErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {rows.length > 0 ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Previewing {rows.length} student{rows.length === 1 ? '' : 's'}
              </p>
              <Button
                type="button"
                disabled={!canImport || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                Import students
              </Button>
            </div>
            <div className="max-h-80 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>First name</TableHead>
                    <TableHead>Last name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Password</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.row}>
                      <TableCell>{row.row}</TableCell>
                      <TableCell>{row.firstName}</TableCell>
                      <TableCell>{row.lastName}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.password ? 'Provided' : 'Default'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {importResult ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">Import complete</p>
                <p className="text-sm text-muted-foreground">
                  Created {importResult.summary.created}, failed {importResult.summary.failed} of{' '}
                  {importResult.summary.total}.
                </p>
              </div>
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/users">View users</Link>
              </Button>
            </div>
            {importResult.results.some((result) => result.status === 'failed') ? (
              <div className="max-h-64 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.results
                      .filter((result) => result.status === 'failed')
                      .map((result) => (
                        <TableRow key={`${result.row}-${result.email}`}>
                          <TableCell>{result.row}</TableCell>
                          <TableCell>{result.email}</TableCell>
                          <TableCell>Failed</TableCell>
                          <TableCell>{result.message}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-2">
        <Button type="button" variant="outline" asChild>
          <Link to="/admin/users">Cancel</Link>
        </Button>
      </div>
    </div>
  )
}
