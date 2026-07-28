import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { LecturerSummary } from '@/types/domain'

const INITIAL_VISIBLE = 4
const SEARCH_THRESHOLD = 8

interface LecturerClassesListProps {
  classes: LecturerSummary['classes']
  activeClassId?: string
}

function sortClasses(
  classes: LecturerSummary['classes'],
  activeClassId?: string,
) {
  return [...classes].sort((a, b) => {
    if (a.classId === activeClassId) return -1
    if (b.classId === activeClassId) return 1
    return a.className.localeCompare(b.className)
  })
}

export function LecturerClassesList({ classes, activeClassId }: LecturerClassesListProps) {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  const sortedClasses = useMemo(
    () => sortClasses(classes, activeClassId),
    [classes, activeClassId],
  )

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return sortedClasses
    return sortedClasses.filter((cls) => cls.className.toLowerCase().includes(query))
  }, [search, sortedClasses])

  const visibleClasses = expanded ? filteredClasses : sortedClasses.slice(0, INITIAL_VISIBLE)
  const hasHiddenClasses = classes.length > INITIAL_VISIBLE
  const showSearch = expanded && classes.length >= SEARCH_THRESHOLD

  if (classes.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Your classes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {classes.length} {classes.length === 1 ? 'class' : 'classes'} assigned to you
          </p>
        </div>
        {hasHiddenClasses ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setExpanded((current) => !current)
              if (expanded) setSearch('')
            }}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                Show all {classes.length}
              </>
            )}
          </Button>
        ) : null}
      </div>

      {showSearch ? (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search classes…"
            className="pl-9"
            aria-label="Search classes"
          />
        </div>
      ) : null}

      <div
        className={cn(
          'grid gap-4 md:grid-cols-2',
          expanded && classes.length > INITIAL_VISIBLE && 'max-h-[28rem] overflow-y-auto pr-1',
        )}
      >
        {visibleClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground md:col-span-2">
            No classes match your search.
          </p>
        ) : (
          visibleClasses.map((cls) => {
            const isActive = cls.classId === activeClassId

            return (
              <Link
                key={cls.classId}
                to={`/lecturer/analytics?classId=${cls.classId}`}
                className={cn(
                  'rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30 md:p-6',
                  isActive && 'border-primary bg-muted/40 ring-1 ring-primary/20',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <p className="font-semibold">{cls.className}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {cls.studentCount} students · {cls.assignmentCount} assignments ·{' '}
                  {formatPercent(cls.completionRate)} completion
                </p>
              </Link>
            )
          })
        )}
      </div>

      {!expanded && hasHiddenClasses ? (
        <p className="text-xs text-muted-foreground">
          Showing {INITIAL_VISIBLE} of {classes.length} classes.
        </p>
      ) : null}
    </section>
  )
}
