import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QueryError } from '@/components/feedback/EmptyState'
import { formatPercent } from '@/lib/format'
import type { StudentTagAnalytics } from '@/types/domain'

interface WeakTopicsPanelProps {
  data?: StudentTagAnalytics
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
}

export function WeakTopicsPanel({ data, isLoading, error, onRetry }: WeakTopicsPanelProps) {
  if (isLoading) return <Skeleton className="h-48 w-full" />
  if (error) return <QueryError error={error} onRetry={onRetry} />

  if (!data) return null

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Topic performance</CardTitle>
        </CardHeader>
        <CardContent>
          {data.byTag.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tagged question data yet.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Correct rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byTag.map((tag) => (
                    <TableRow key={tag.tagId}>
                      <TableCell className="font-medium">{tag.tagName}</TableCell>
                      <TableCell className="tabular-nums">{tag.attemptCount}</TableCell>
                      <TableCell className="tabular-nums">
                        {tag.correctRate != null ? formatPercent(tag.correctRate) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Areas to improve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.weakTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No weak topics identified. Keep up the good work.
            </p>
          ) : (
            data.weakTopics.map((topic) => (
              <div
                key={topic.tagId}
                className="rounded-lg border bg-muted/30 px-4 py-3"
              >
                <p className="font-medium">{topic.tagName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {topic.correctCount} of {topic.attemptCount} correct (
                  {topic.correctRate != null ? formatPercent(topic.correctRate) : '—'})
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
