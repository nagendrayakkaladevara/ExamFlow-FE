import * as XLSX from 'xlsx'

export interface ParsedStudentRow {
  row: number
  firstName: string
  lastName: string
  email: string
  password?: string
}

export interface ParseStudentSpreadsheetResult {
  rows: ParsedStudentRow[]
  errors: string[]
}

const FIELD_ALIASES: Record<string, keyof Omit<ParsedStudentRow, 'row'>> = {
  firstname: 'firstName',
  'first name': 'firstName',
  first_name: 'firstName',
  lastname: 'lastName',
  'last name': 'lastName',
  last_name: 'lastName',
  email: 'email',
  'email address': 'email',
  mail: 'email',
  password: 'password',
  pass: 'password',
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function cellValue(value: unknown): string {
  if (value == null) return ''
  return String(value).trim()
}

function parseWorksheet(sheet: XLSX.WorkSheet): ParseStudentSpreadsheetResult {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  })

  if (matrix.length === 0) {
    return { rows: [], errors: ['The spreadsheet is empty.'] }
  }

  const headerRow = matrix[0] ?? []
  const columnMap = new Map<number, keyof Omit<ParsedStudentRow, 'row'>>()

  headerRow.forEach((header, index) => {
    const field = FIELD_ALIASES[normalizeHeader(header)]
    if (field) columnMap.set(index, field)
  })

  const requiredFields: Array<keyof Omit<ParsedStudentRow, 'row' | 'password'>> = [
    'firstName',
    'lastName',
    'email',
  ]
  const missingFields = requiredFields.filter(
    (field) => ![...columnMap.values()].includes(field),
  )

  if (missingFields.length > 0) {
    return {
      rows: [],
      errors: [
        `Missing required columns: ${missingFields.join(', ')}. Use firstName, lastName, and email.`,
      ],
    }
  }

  const rows: ParsedStudentRow[] = []
  const errors: string[] = []

  matrix.slice(1).forEach((rawRow, index) => {
    const rowNumber = index + 2
    const parsed: Partial<ParsedStudentRow> = { row: rowNumber }

    columnMap.forEach((field, columnIndex) => {
      const value = cellValue(rawRow[columnIndex])
      if (value) parsed[field] = value
    })

    if (!parsed.firstName && !parsed.lastName && !parsed.email) {
      return
    }

    if (!parsed.firstName || !parsed.lastName || !parsed.email) {
      errors.push(`Row ${rowNumber}: firstName, lastName, and email are required.`)
      return
    }

    rows.push({
      row: rowNumber,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      ...(parsed.password ? { password: parsed.password } : {}),
    })
  })

  if (rows.length === 0 && errors.length === 0) {
    errors.push('No student rows found below the header row.')
  }

  return { rows, errors }
}

export async function parseStudentSpreadsheet(file: File): Promise<ParseStudentSpreadsheetResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    return { rows: [], errors: ['No worksheet found in the file.'] }
  }

  return parseWorksheet(workbook.Sheets[sheetName]!)
}

export function downloadStudentImportTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['firstName', 'lastName', 'email', 'password'],
    ['Ada', 'Lovelace', 'ada.lovelace@school.edu', 'ChangeMe123'],
    ['Alan', 'Turing', 'alan.turing@school.edu', ''],
  ])
  worksheet['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 32 }, { wch: 16 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
  XLSX.writeFile(workbook, 'student-import-template.xlsx')
}
