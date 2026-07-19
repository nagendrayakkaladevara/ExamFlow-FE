import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
      <Card className="gap-0 py-0 shadow-sm">
        <CardContent className="pt-6">
          <FieldGroup>
            <FieldSet className="gap-4">
              <div className="space-y-1">
                <FieldLegend variant="legend">Upload spreadsheet</FieldLegend>
                <FieldDescription>
                  Import up to 200 student accounts from an Excel file.
                </FieldDescription>
              </div>
              <div className="rounded-lg border border-dashed p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Required columns</p>
                    <p className="text-sm text-muted-foreground">
                      firstName, lastName, email. Password is optional if you set a default below.
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
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileSpreadsheet className="size-4" />
                    {fileName}
                  </p>
                ) : null}
              </div>
            </FieldSet>

            <FieldSeparator />

            <FieldSet className="gap-4">
              <div className="space-y-1">
                <FieldLegend variant="legend">Default password</FieldLegend>
                <FieldDescription>
                  Applied to rows that do not include a password column.
                </FieldDescription>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPassword">Default password</Label>
                <PasswordInput
                  id="defaultPassword"
                  value={defaultPassword}
                  onChange={(event) => setDefaultPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
                <p className="text-xs text-muted-foreground">
                  {rowsMissingPassword > 0
                    ? `${rowsMissingPassword} row(s) need this default password.`
                    : 'Leave blank if every row includes its own password.'}
                </p>
              </div>
            </FieldSet>

            {parseErrors.length > 0 ? (
              <>
                <FieldSeparator />
                <Alert variant="destructive">
                  <AlertTitle>Fix these issues before importing</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-5">
                      {parseErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </>
            ) : null}
          </FieldGroup>
        </CardContent>

        {rows.length > 0 ? (
          <CardFooter className="justify-between border-t bg-muted/20 py-4">
            <p className="text-sm text-muted-foreground">
              Previewing {rows.length} student{rows.length === 1 ? '' : 's'}
            </p>
            <Button
              type="button"
              disabled={!canImport || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing…
                </>
              ) : (
                'Import students'
              )}
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      {rows.length > 0 ? (
        <Card className="py-0 shadow-sm">
          <ScrollArea className="h-80">
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
          </ScrollArea>
        </Card>
      ) : null}

      {importResult ? (
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle>Import complete</CardTitle>
              <CardDescription>
                Created {importResult.summary.created}, failed {importResult.summary.failed} of{' '}
                {importResult.summary.total}.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/users">View users</Link>
            </Button>
          </CardHeader>

          {importResult.results.some((result) => result.status === 'failed') ? (
            <CardContent className="pt-0">
              <ScrollArea className="h-64 rounded-lg border">
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
              </ScrollArea>
            </CardContent>
          ) : null}
        </Card>
      ) : null}
    </div>
  )
}
