import { useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Check, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'

const MAX_ROWS = 200

const WIZARD_STEPS = [
  { step: 1, label: 'Upload' },
  { step: 2, label: 'Review' },
  { step: 3, label: 'Results' },
] as const

type WizardStep = (typeof WIZARD_STEPS)[number]['step']

const tableHeadClassName =
  'h-12 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground'
const tableCellClassName = 'h-12 px-4'

function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  return (
    <nav aria-label="Import progress" className="flex flex-wrap items-center gap-2">
      {WIZARD_STEPS.map((item, index) => {
        const isComplete = currentStep > item.step
        const isCurrent = currentStep === item.step

        return (
          <div key={item.step} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-2 text-sm',
                isCurrent
                  ? 'font-medium text-foreground'
                  : isComplete
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/70',
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border text-xs font-medium',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isComplete && 'border-primary bg-primary/10 text-primary',
                  !isCurrent && !isComplete && 'border-border bg-background',
                )}
              >
                {isComplete ? <Check className="size-3.5" aria-hidden /> : item.step}
              </span>
              <span>{item.label}</span>
            </div>
            {index < WIZARD_STEPS.length - 1 ? (
              <span className="h-px w-8 bg-border sm:w-12" aria-hidden />
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}

function ImportSummary({ result }: { result: BulkImportResult }) {
  const items = [
    { label: 'Total', value: result.summary.total },
    { label: 'Created', value: result.summary.created, tone: 'success' as const },
    { label: 'Failed', value: result.summary.failed, tone: 'error' as const },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border bg-muted/20 px-4 py-3"
        >
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              'mt-1 text-2xl font-semibold tracking-tight',
              item.tone === 'success' && item.value > 0 && 'text-emerald-600',
              item.tone === 'error' && item.value > 0 && 'text-destructive',
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export function StudentBulkImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<WizardStep>(1)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [fileWarning, setFileWarning] = useState<string | null>(null)
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
      setStep(3)
      toast.success(`Imported ${result.summary.created} of ${result.summary.total} students.`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to import students.')
    },
  })

  const rowsMissingPassword = rows.filter((row) => !row.password).length
  const canContinueFromUpload =
    rows.length > 0 && parseErrors.length === 0
  const canImport =
    canContinueFromUpload &&
    (rowsMissingPassword === 0 || defaultPassword.length >= 8)

  async function handleFileChange(file: File | null) {
    setImportResult(null)
    setStep(1)

    if (!file) {
      setFileName(null)
      setRows([])
      setParseErrors([])
      setFileWarning(null)
      return
    }

    setFileName(file.name)

    try {
      const result = await parseStudentSpreadsheet(file)
      setRows(result.rows.slice(0, MAX_ROWS))
      setParseErrors(result.errors)
      setFileWarning(
        result.rows.length > MAX_ROWS
          ? `Only the first ${MAX_ROWS} rows will be imported.`
          : null,
      )
    } catch {
      setRows([])
      setParseErrors(['Unable to read the spreadsheet. Use an .xlsx or .xls file.'])
      setFileWarning(null)
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0] ?? null
    void handleFileChange(file)
  }

  function resetImport() {
    setStep(1)
    setFileName(null)
    setRows([])
    setParseErrors([])
    setFileWarning(null)
    setDefaultPassword('')
    setImportResult(null)
  }

  const failedResults =
    importResult?.results.filter((result) => result.status === 'failed') ?? []

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={step} />

      <Card className="gap-0 py-0 shadow-sm">
        <CardContent className="pt-6">
          {step === 1 ? (
            <FieldGroup>
              <FieldSet className="gap-4">
                <div className="space-y-1">
                  <FieldLegend variant="legend">Prepare spreadsheet</FieldLegend>
                  <FieldDescription>
                    Download the template, fill in student details, then upload your file.
                    Imports are limited to {MAX_ROWS} rows.
                  </FieldDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={downloadStudentImportTemplate}>
                    <Download className="size-4" />
                    Download template
                  </Button>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload spreadsheet"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center transition-colors',
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-foreground/20 hover:bg-muted/30',
                  )}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Upload className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">
                      {fileName ? 'Replace spreadsheet' : 'Upload spreadsheet'}
                    </p>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Drag and drop an Excel file here, or click to browse. Required columns:
                      firstName, lastName, email.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                    Choose file
                  </Button>
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
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-4 py-3 text-sm">
                    <FileSpreadsheet className="size-4 text-muted-foreground" />
                    <span className="font-medium">{fileName}</span>
                    {rows.length > 0 ? (
                      <span className="text-muted-foreground">
                        — {rows.length} student{rows.length === 1 ? '' : 's'} ready to review
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </FieldSet>

              {fileWarning ? (
                <Alert>
                  <AlertDescription>{fileWarning}</AlertDescription>
                </Alert>
              ) : null}

              {parseErrors.length > 0 ? (
                <>
                  <FieldSeparator />
                  <Alert variant="destructive">
                    <AlertTitle>Fix these issues before continuing</AlertTitle>
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
          ) : null}

          {step === 2 ? (
            <FieldGroup>
              <FieldSet className="gap-4">
                <div className="space-y-1">
                  <FieldLegend variant="legend">Review students</FieldLegend>
                  <FieldDescription>
                    Confirm the parsed rows before creating accounts. Password can be set per row
                    or applied as a default below.
                  </FieldDescription>
                </div>

                <div className="rounded-lg border">
                  <ScrollArea className="h-80">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className={tableHeadClassName}>Row</TableHead>
                          <TableHead className={tableHeadClassName}>First name</TableHead>
                          <TableHead className={tableHeadClassName}>Last name</TableHead>
                          <TableHead className={tableHeadClassName}>Email</TableHead>
                          <TableHead className={tableHeadClassName}>Password</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.row}>
                            <TableCell className={tableCellClassName}>{row.row}</TableCell>
                            <TableCell className={tableCellClassName}>{row.firstName}</TableCell>
                            <TableCell className={tableCellClassName}>{row.lastName}</TableCell>
                            <TableCell className={tableCellClassName}>{row.email}</TableCell>
                            <TableCell className={tableCellClassName}>
                              <Badge variant="outline">
                                {row.password ? 'Provided' : 'Default'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                <p className="text-xs text-muted-foreground">
                  Showing {rows.length} student{rows.length === 1 ? '' : 's'}
                </p>
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
            </FieldGroup>
          ) : null}

          {step === 3 && importResult ? (
            <FieldGroup>
              <FieldSet className="gap-4">
                <div className="space-y-1">
                  <FieldLegend variant="legend">Import complete</FieldLegend>
                  <FieldDescription>
                    {importResult.summary.failed === 0
                      ? 'All student accounts were created successfully.'
                      : 'Some rows could not be imported. Review the failures below.'}
                  </FieldDescription>
                </div>

                <ImportSummary result={importResult} />
              </FieldSet>

              {failedResults.length > 0 ? (
                <>
                  <FieldSeparator />
                  <FieldSet className="gap-4">
                    <div className="space-y-1">
                      <FieldLegend variant="legend">Failed rows</FieldLegend>
                      <FieldDescription>
                        Resolve these issues in your spreadsheet and import again.
                      </FieldDescription>
                    </div>

                    <div className="rounded-lg border">
                      <ScrollArea className="h-64">
                        <Table>
                          <TableHeader className="sticky top-0 z-10 bg-background">
                            <TableRow className="hover:bg-transparent">
                              <TableHead className={tableHeadClassName}>Row</TableHead>
                              <TableHead className={tableHeadClassName}>Email</TableHead>
                              <TableHead className={tableHeadClassName}>Status</TableHead>
                              <TableHead className={tableHeadClassName}>Message</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {failedResults.map((result) => (
                              <TableRow key={`${result.row}-${result.email}`}>
                                <TableCell className={tableCellClassName}>{result.row}</TableCell>
                                <TableCell className={tableCellClassName}>{result.email}</TableCell>
                                <TableCell className={tableCellClassName}>
                                  <Badge variant="destructive">Failed</Badge>
                                </TableCell>
                                <TableCell className={cn(tableCellClassName, 'whitespace-normal')}>
                                  {result.message}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </FieldSet>
                </>
              ) : null}
            </FieldGroup>
          ) : null}
        </CardContent>

        <CardFooter className="justify-between border-t bg-muted/20 py-4">
          {step === 1 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {fileName ? `Selected: ${fileName}` : 'No file selected'}
              </p>
              <Button
                type="button"
                disabled={!canContinueFromUpload}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
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
                  `Import ${rows.length} student${rows.length === 1 ? '' : 's'}`
                )}
              </Button>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Button type="button" variant="secondary" onClick={resetImport}>
                Import another file
              </Button>
              <Button type="button" asChild>
                <Link to="/admin/users">View users</Link>
              </Button>
            </>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )
}
