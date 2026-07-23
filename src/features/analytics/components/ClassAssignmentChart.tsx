import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { chartTheme } from '@/features/analytics/components/chart-theme'
import { formatPercent } from '@/lib/format'

export interface ClassAssignmentChartItem {
  assignmentId: string
  title: string
  completionRate: number
  averageScore?: number | null
}

interface ClassAssignmentChartProps {
  items: ClassAssignmentChartItem[]
  isLoading?: boolean
  metric?: 'completion' | 'averageScore'
}

function truncateLabel(label: string, maxLength = 20) {
  return label.length > maxLength ? `${label.slice(0, maxLength)}…` : label
}

export function ClassAssignmentChart({
  items,
  isLoading,
  metric = 'completion',
}: ClassAssignmentChartProps) {
  if (isLoading) {
    return <Skeleton className="h-72 w-full" />
  }

  const data = items
    .map((item) => ({
      assignmentId: item.assignmentId,
      label: truncateLabel(item.title),
      fullTitle: item.title,
      value:
        metric === 'averageScore'
          ? (item.averageScore ?? 0)
          : item.completionRate * 100,
    }))
    .filter((item) => item.value > 0 || metric === 'completion')

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Assignment performance data will appear once students submit work.
      </p>
    )
  }

  const title = metric === 'averageScore' ? 'Average score by assignment' : 'Completion by assignment'
  const valueLabel = metric === 'averageScore' ? 'Average score' : 'Completion rate'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={{ stroke: chartTheme.grid }}
                tickLine={false}
                interval={0}
                angle={data.length > 3 ? -25 : 0}
                textAnchor={data.length > 3 ? 'end' : 'middle'}
                height={data.length > 3 ? 56 : 30}
              />
              <YAxis
                domain={metric === 'averageScore' ? [0, 100] : [0, 100]}
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                label={{
                  value: metric === 'averageScore' ? 'Score %' : 'Completion %',
                  angle: -90,
                  position: 'insideLeft',
                  fill: chartTheme.axis,
                  fontSize: 12,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  borderColor: chartTheme.tooltipBorder,
                  color: chartTheme.tooltipText,
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => {
                  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
                  const formatted =
                    metric === 'averageScore'
                      ? `${numeric.toFixed(1)}%`
                      : formatPercent(numeric / 100)
                  return [formatted, valueLabel]
                }}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload as { fullTitle?: string } | undefined
                  return item?.fullTitle ?? ''
                }}
              />
              <Bar dataKey="value" fill={chartTheme.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
